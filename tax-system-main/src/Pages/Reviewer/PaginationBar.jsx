// src/components/reviewer/PaginationBar.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";

const PaginationBar = ({
  pageNumber = 1,
  pageSize = 10,
  totalCount = 0,
  totalPages: totalPagesProp,
  onPageChange,
  disabled = false,
}) => {
  const [jumpPage, setJumpPage] = useState(String(pageNumber));

  useEffect(() => {
    setJumpPage(String(pageNumber));
  }, [pageNumber]);

  const totalPages = useMemo(() => {
    if (Number.isFinite(totalPagesProp) && totalPagesProp > 0) return totalPagesProp;
    const pages = Math.ceil((totalCount || 0) / (pageSize || 10));
    return pages > 0 ? pages : 1;
  }, [totalCount, pageSize, totalPagesProp]);

  const goToPage = (page) => {
    if (disabled) return;
    const safePage = Math.min(Math.max(1, Number(page)), totalPages);
    if (safePage !== pageNumber) onPageChange?.(safePage);
  };

  const handleJump = () => {
    const page = Number(jumpPage);
    if (!Number.isFinite(page)) return;
    goToPage(page);
  };

  const handleJumpKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); handleJump(); }
  };

  const start = Math.min((pageNumber - 1) * pageSize + 1, totalCount);
  const end   = Math.min(pageNumber * pageSize, totalCount);

  return (
    <div
      className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 px-3 py-2 border-top"
      style={{ background: "#fafafa" }}
    >
      {/* ملخص نصي */}
      <span className="small text-muted">
        {totalCount > 0
          ? `عرض ${start}–${end} من ${totalCount.toLocaleString("ar-EG")} عنصر`
          : "لا توجد عناصر"}
      </span>

      {/* أزرار التنقل + القفز */}
      <div className="d-flex align-items-center gap-2 flex-wrap justify-content-end">
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => goToPage(1)}
          disabled={disabled || pageNumber <= 1}
          title="الصفحة الأولى"
        >
          «
        </Button>
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => goToPage(pageNumber - 1)}
          disabled={disabled || pageNumber <= 1}
        >
          السابق
        </Button>

        <span className="small px-1 text-secondary fw-semibold">
          {pageNumber} / {totalPages}
        </span>

        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => goToPage(pageNumber + 1)}
          disabled={disabled || pageNumber >= totalPages}
        >
          التالي
        </Button>
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => goToPage(totalPages)}
          disabled={disabled || pageNumber >= totalPages}
          title="الصفحة الأخيرة"
        >
          »
        </Button>

        <InputGroup size="sm" style={{ width: 160 }}>
          <InputGroup.Text className="small">صفحة</InputGroup.Text>
          <Form.Control
            type="number"
            min={1}
            max={totalPages}
            value={jumpPage}
            onChange={(e) => setJumpPage(e.target.value)}
            onKeyDown={handleJumpKeyDown}
            disabled={disabled}
            style={{ maxWidth: 56 }}
          />
          <Button variant="primary" onClick={handleJump} disabled={disabled}>
            ↵
          </Button>
        </InputGroup>
      </div>
    </div>
  );
};

export default PaginationBar;