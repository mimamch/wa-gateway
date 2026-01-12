import { FC } from "hono/jsx";
import RootLayout from "../layout";

const CreateSessionPage: FC<{
  id: string;
}> = (props) => {
  return (
    <RootLayout title="Sessions">
      <div className="max-w-7xl mx-auto p-6">
        <div>
          <h1 className="text-2xl font-bold">Connect Sessions</h1>
          <p className="text-gray-500 text-sm">
            Scan the QR code below with your WhatsApp to connect the session.
          </p>
        </div>

        <div className="w-[50vw] h-auto mt-6 p-6 border border-gray-200 bg-gray-100 rounded-lg flex flex-col items-center justify-center">
          <p>
            Status:{" "}
            <span id="status" className="px-2 py-1 bg-blue-100 rounded">
              WAITING
            </span>
          </p>
          <p id="redirecting" className="my-1 hidden">
            Redirecting in several seconds...
          </p>
          <div id="qr" className="mt-2"></div>
        </div>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
        const id = "${props.id}";
        `,
        }}
      ></script>
      <script src="/assets/js/qrcode.min.js"></script>
      <script src="/assets/js/create-session.js"></script>
    </RootLayout>
  );
};

export default CreateSessionPage;
