import { FC } from "hono/jsx";
import RootLayout from "../layout";

const DashboardIndex: FC = () => {
  return (
    <RootLayout title="Dashboard">
      <div className="max-w-7xl mx-auto p-6">
        <div>
          <h1 className="text-2xl font-bold">WA Gateway</h1>
          <p className="text-gray-500 text-sm">
            View full documentation at{" "}
            <a
              target={"_blank"}
              href="https://github.com/mimamch/wa-gateway"
              className="text-green-600 hover:underline"
            >
              https://github.com/mimamch/wa-gateway
            </a>
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <a
            href="/dashboard/sessions"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 flex flex-col items-start justify-center gap-4 group"
          >
            <div className="bg-green-100 p-2 rounded-full text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
            <div className="text-start">
              <h2 className="text-xl font-semibold">Sessions</h2>
              <p className="text-gray-500 text-sm">
                Manage your WhatsApp connections and QR codes
              </p>
            </div>
          </a>
        </div>
      </div>
    </RootLayout>
  );
};

export default DashboardIndex;
