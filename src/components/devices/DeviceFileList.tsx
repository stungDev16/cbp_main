/* eslint-disable @typescript-eslint/no-explicit-any */
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { fetchApps, fetchUploads, uploadFiles } from "@/store/slices/file";
import { adbService } from "@/apis/services/adb/adb-service";
import { toast } from "sonner";

export default function DeviceFileList() {
  const dispatch = useDispatch();
  const { files, apps } = useSelector((state: RootState) => state.file);
  const { device } = useSelector((state: RootState) => state.adb);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Note: Parent container is responsible for initial fetch to avoid duplicates.

  const handleUpload = async () => {
    if (!selectedFiles.length) return;
    try {
      await dispatch(uploadFiles({ files: selectedFiles as any })).unwrap();
      setSelectedFiles([]);
      fileInputRef.current && (fileInputRef.current.value = "");
      dispatch(fetchUploads());
      toast.success("Upload successful");
    } catch (e) {
      toast.error("Upload failed");
    }
  };

  const handleInstall = async (fileName: string, source: "apps" | "uploads") => {
    const { data } = await adbService.install({ app: fileName, device: device || undefined, source });
    if (data.logs?.length) toast.success(data.logs.join("\n"));
    if (data.errors?.length) toast.error(data.errors.join("\n"));
  };

  const handleStart = async (fileName: string) => {
    const { data } = await adbService.start({ app: fileName, device: device || undefined });
    if (data.logs?.length) toast.success(data.logs.join("\n"));
    if (data.errors?.length) toast.error(data.errors.join("\n"));
  };

  const handlePin = async (fileName: string) => {
    const { data } = await adbService.pin({ app: fileName, device: device || undefined });
    if (data.logs?.length) toast.success(data.logs.join("\n"));
    if (data.errors?.length) toast.error(data.errors.join("\n"));
  };

  const handleUnpin = async (fileName: string) => {
    const { data } = await adbService.unpin({ app: fileName, device: device || undefined });
    if (data.logs?.length) toast.success(data.logs.join("\n"));
    if (data.errors?.length) toast.error(data.errors.join("\n"));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => {
            setSelectedFiles(Array.from(e.target.files || []));
          }}
        />
        <Button onClick={handleUpload} disabled={!selectedFiles.length}>Upload</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="border rounded-lg overflow-hidden">
          <div className="p-3 font-medium">/apps</div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"><Checkbox /></TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="w-48">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apps?.length ? (
                apps.map((name) => (
                  <TableRow key={name}>
                    <TableCell><Checkbox /></TableCell>
                    <TableCell>{name}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleInstall(name, "apps")}>Install</Button>
                        <Button size="sm" variant="outline" onClick={() => handleStart(name)}>Start</Button>
                        <Button size="sm" variant="outline" onClick={() => handlePin(name)}>Pin</Button>
                        <Button size="sm" variant="outline" onClick={() => handleUnpin(name)}>Unpin</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-6 text-sm text-muted-foreground">No apps</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="p-3 font-medium">/uploads</div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"><Checkbox /></TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="w-48">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files?.length ? (
                files.map((name) => (
                  <TableRow key={name}>
                    <TableCell><Checkbox /></TableCell>
                    <TableCell>{name}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleInstall(name, "uploads")}>Install</Button>
                        <Button size="sm" variant="outline" onClick={() => handleStart(name)}>Start</Button>
                        <Button size="sm" variant="outline" onClick={() => handlePin(name)}>Pin</Button>
                        <Button size="sm" variant="outline" onClick={() => handleUnpin(name)}>Unpin</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-6 text-sm text-muted-foreground">No uploads</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}


