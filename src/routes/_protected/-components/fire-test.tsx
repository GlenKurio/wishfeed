import { useState } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "../../../lib/firebase";
// Import from the file we created in Step 5

function FireTest() {
  const [responseMsg, setResponseMsg] = useState("");

  const handleCallFunction = async () => {
    try {
      // 'sayHello' must match the export name in functions/src/index.ts
      const createWishFunction = httpsCallable(functions, "createWish");

      // Call the function and pass data
      const result: any = await createWishFunction({
        url: "https://ca.manscaped.com/products/the-pro-beard-kit",
      });
      console.log("RESULT: ", result);
      setResponseMsg("Done!");
    } catch (error) {
      console.error("Error calling function:", error);
    }
  };

  return (
    <div>
      <button className="btn" onClick={handleCallFunction}>
        Call Firebase Function
      </button>
      <p>Response: {responseMsg}</p>
    </div>
  );
}

export default FireTest;
