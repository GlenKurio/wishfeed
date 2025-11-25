import { useState } from "react";
import { scrapeProductUrl } from "../../../lib/firebase/functions";
// Import from the file we created in Step 5

function FireTest() {
  const [responseMsg, setResponseMsg] = useState("");

  const handleCallFunction = async () => {
    try {
      const result = await scrapeProductUrl({
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
