import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CommitteeHome = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/committee/appeals', { replace: true });
  }, [navigate]);
  return null;
};

export default CommitteeHome;
