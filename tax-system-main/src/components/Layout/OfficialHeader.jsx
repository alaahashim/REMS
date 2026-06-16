import React from 'react';

const OfficialHeader = () => {
  return (
    <div className="official-header d-flex align-items-center justify-content-between px-4 py-2">
      <div className="d-flex align-items-center gap-3">
        {/* أيقونة أو شعار وهمي للجمهورية */}
        <div className="emblem-placeholder bg-white text-danger d-flex justify-content-center align-items-center rounded-circle" style={{width: '50px', height: '50px', border: '2px solid gold'}}>
            <i className="fa-solid fa-star"></i>
        </div>
        <div className="text-white">
            <h4 className="m-0 fw-bold" style={{fontSize: '1.1rem', lineHeight: '1.2'}}>جمهورية مصر العربية</h4>
            <h5 className="m-0 fw-light" style={{fontSize: '0.9rem', opacity: 0.9}}>وزارة المالية - مصلحة الضرائب العقارية</h5>
        </div>
      </div>
      
      <div className="text-white text-end d-none d-md-block">
        <div className="fw-bold">نظام تحصيل وتقدير الضرائب</div>
        <small>Version 2.0 (Gov)</small>
      </div>
    </div>
  );
};

export default OfficialHeader;