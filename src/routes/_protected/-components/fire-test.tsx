import { useState } from "react";
import { scrapeProductUrl } from "../../../lib/firebase/functions";
// Import from the file we created in Step 5

function FireTest() {
  const [responseMsg, setResponseMsg] = useState("");

  const handleCallFunction = async () => {
    try {
      const result = await scrapeProductUrl({
        url: "https://www.amazon.ca/Apple-Smartwatch-Silver-Purple-Always/dp/B0FQFBV6RX/ref=asc_df_B0FQFBV6RX?mcid=7e0213786a5a3d50aaffa608725e7e03&tag=googleshopc0c-20&linkCode=df0&hvadid=753014479341&hvpos=&hvnetw=g&hvrand=5334978061667133485&hvpone=&hvptwo=&hvqmt=&hvdev=c&hvdvcmdl=&hvlocint=&hvlocphy=9001192&hvtargid=pla-2445889890412&hvocijid=5334978061667133485-B0FQFBV6RX-&hvexpln=0&gad_source=1&th=1",
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
