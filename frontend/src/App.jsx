import { RouterProvider } from "react-router";
import { router } from "./routes";
import FeedbackWidget from "./components/common/FeedbackWidget";

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <FeedbackWidget />
    </>
  );
}
