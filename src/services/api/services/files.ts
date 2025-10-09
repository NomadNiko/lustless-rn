import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import { FileEntity } from "../types/file-entity";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";

export type FileUploadResponse = {
  file: FileEntity;
};

export function useFilesUploadService() {
  const fetchBase = useFetch();

  return useCallback(
    (formData: FormData) => {
      return fetchBase(`${API_URL}/api/v1/files/upload`, {
        method: "POST",
        body: formData,
      }).then(wrapperFetchJsonResponse<FileUploadResponse>);
    },
    [fetchBase]
  );
}
