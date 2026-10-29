import Button from "@/components/ui/Button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="p-6">
      <h1 className="text-h1">planIT วางแผนการเรียน 4 ปี</h1>
      <p className="text-fg-muted">ทดสอบฟอนต์ Inter + IBM Plex Sans Thai</p>
      <Button variant="primary">
        <Link href="/uiexample">Click here to view UI Example</Link>
      </Button>
    </main>
  );
}
