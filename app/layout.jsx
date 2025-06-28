import "../globals.css";
import Task from "./components/Task";

export const metadata = {
  title: "Bloq",
  description: "Screening Task",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <div className="bg-[#FAFAFA] p-2 min-h-screen max-h-screen flex flex-row">
          <div className="max-w-xs mr-4 flex-grow overflow-y-auto max-h-full">
            <Task />
          </div>
          <div className="flex-1">{children}</div>
        </div>
      </body>
    </html>
  );
}
