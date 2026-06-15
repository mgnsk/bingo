import { useEffect, useRef, useState } from "react";
import { BlobProvider } from "@react-pdf/renderer";
import type { BingoTableData } from "./types";
import { BingoTable } from "./BingoTable";

type PDFDownloaderProps = {
  title: string;
  tables: BingoTableData[];
  isGenerating: boolean;
  onComplete: () => void;
};

export function PDFDownloader({
  title,
  tables,
  isGenerating,
  onComplete,
}: PDFDownloaderProps) {
  const downloadedRef = useRef(false);
  const [blobState, setBlobState] = useState<{
    blob: Blob | null;
    loading: boolean;
  }>({
    blob: null,
    loading: true,
  });

  useEffect(() => {
    if (
      isGenerating &&
      blobState.blob &&
      !blobState.loading &&
      !downloadedRef.current
    ) {
      downloadedRef.current = true;
      const url = URL.createObjectURL(blobState.blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "bingo-cards.pdf";
      link.click();
      URL.revokeObjectURL(url);
      onComplete();
    } else if (!isGenerating) {
      downloadedRef.current = false;
    }
  }, [blobState.blob, blobState.loading, isGenerating, onComplete]);

  return (
    <BlobProvider document={<BingoTable title={title} tables={tables} />}>
      {({ blob, loading }) => {
        // Schedule state update after current render
        if (
          (blob !== blobState.blob || loading !== blobState.loading) &&
          typeof queueMicrotask !== "undefined"
        ) {
          queueMicrotask(() => {
            setBlobState({ blob, loading });
          });
        }
        return null;
      }}
    </BlobProvider>
  );
}
