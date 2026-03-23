import { 
  collection, 
  doc, 
  runTransaction, 
  serverTimestamp, 
  Timestamp,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { Firestore } from "firebase/firestore";
import { BookMetadata } from "@/hooks/use-books";

export interface BorrowingRecord {
  id?: string;
  userId: string;
  userName: string;
  bookId: string;
  bookTitle: string;
  bookCover: string;
  status: 'active' | 'returned' | 'overdue';
  borrowDate: Timestamp;
  dueDate: Timestamp;
  returnDate?: Timestamp | null;
  renewalCount?: number;
}

export interface InventoryRecord {
  id: string; // Google Books ID
  totalCopies: number;
  availableCopies: number;
  title: string;
}

export const libraryService = {
  /**
   * Orchestrates an atomic borrowing transaction.
   * Ensures book availability before committing the loan.
   */
  async borrowBook(
    firestore: Firestore, 
    userId: string, 
    userName: string,
    book: BookMetadata,
    durationDays: number = 14
  ) {
    const borrowingRef = doc(collection(firestore, "borrowings"));
    const inventoryRef = doc(firestore, "books_inventory", book.id);

    try {
      await runTransaction(firestore, async (transaction) => {
        const inventoryDoc = await transaction.get(inventoryRef);
        
        let available = 0;
        let total = 0;

        if (inventoryDoc.exists()) {
          const data = inventoryDoc.data() as InventoryRecord;
          available = data.availableCopies;
          total = data.totalCopies;
        } else {
          // If not in inventory, initialize with a default count for testing
          // In a real system, admins would seed inventory
          available = 5; 
          total = 5;
        }

        if (available <= 0) {
          throw new Error("Institutional Inventory Depleted: No copies available for loan.");
        }

        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + durationDays);

        // 1. Create Borrowing Record
        transaction.set(borrowingRef, {
          userId,
          userName,
          bookId: book.id,
          bookTitle: book.title,
          bookCover: book.coverImage,
          status: 'active',
          borrowDate: serverTimestamp(),
          dueDate: Timestamp.fromDate(dueDate),
          returnDate: null
        });

        // 2. Update Inventory
        transaction.set(inventoryRef, {
          id: book.id,
          title: book.title,
          totalCopies: total,
          availableCopies: available - 1
        }, { merge: true });
      });

      return { success: true };
    } catch (error: any) {
      console.error("Borrowing Transaction Failed:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Processes a physical book return.
   */
  async returnBook(firestore: Firestore, borrowingId: string, bookId: string) {
    const borrowingRef = doc(firestore, "borrowings", borrowingId);
    const inventoryRef = doc(firestore, "books_inventory", bookId);

    try {
      await runTransaction(firestore, async (transaction) => {
        const borrowingDoc = await transaction.get(borrowingRef);
        const inventoryDoc = await transaction.get(inventoryRef);

        if (!borrowingDoc.exists()) throw new Error("Borrowing Record Inactive");
        
        // 1. Update Status
        transaction.update(borrowingRef, {
          status: 'returned',
          returnDate: serverTimestamp()
        });

        // 2. Restock Inventory
        if (inventoryDoc.exists()) {
          const data = inventoryDoc.data() as InventoryRecord;
          transaction.update(inventoryRef, {
            availableCopies: data.availableCopies + 1
          });
        }
      });

      return { success: true };
    } catch (error: any) {
      console.error("Return Transaction Failed:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Renews an active borrowing record, extending the due date by 7 days.
   */
  async renewBook(firestore: Firestore, borrowingId: string) {
    const borrowingRef = doc(firestore, "borrowings", borrowingId);

    try {
      await runTransaction(firestore, async (transaction) => {
        const borrowingDoc = await transaction.get(borrowingRef);
        if (!borrowingDoc.exists()) throw new Error("Borrowing Record Not Found.");
        
        const data = borrowingDoc.data() as BorrowingRecord;
        if (data.status !== 'active') throw new Error("Only active loans can be renewed.");
        if ((data.renewalCount || 0) >= 1) throw new Error("Maximum renewal limit reached for this item.");

        const currentDueDate = data.dueDate.toDate();
        const newDueDate = new Date(currentDueDate);
        newDueDate.setDate(newDueDate.getDate() + 7);

        transaction.update(borrowingRef, {
          dueDate: Timestamp.fromDate(newDueDate),
          renewalCount: (data.renewalCount || 0) + 1
        });
      });

      return { success: true };
    } catch (error: any) {
      console.error("Renewal Failed:", error);
      return { success: false, error: error.message };
    }
  }
};
