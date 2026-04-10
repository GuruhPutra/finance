import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

export const testAdd = async () => {
    await addDoc(collection(db, "transactions"), {
        amount: 20000,
        type: "expense",
        category: "makanan",
        note: "test",
        date: new Date()
    });

    alert("Data masuk!");
};