import { useState } from "react";
import { appConfig } from "../../../core/config/app";

export function usePatientPagination() {
  const [page, setPage] = useState<number>(
  appConfig.pagination.defaultPage
);

const [pageSize] = useState<number>(
  appConfig.pagination.defaultPageSize
);

  const onClickPrev = () => {
    setPage((prev) => prev - 1);
  };

  const onClickNext = () => {
    setPage((prev) => prev + 1);
  };

  return {
    page,
    pageSize,

    setPage,

    onClickPrev,
    onClickNext,
  };
}