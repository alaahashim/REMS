import api from "./apiClient";

export const getAppeals = async () => {
    const {data}=await api.get("/committee/appeals");
    return data;
};

export const committeeDecision = async(id,payload)=>{
    const {data}=await api.put(
        `/committee/appeals/${id}/decision`,
        payload
    );

    return data;
};

export const getExemptions = async()=>{
    const {data}=await api.get("/committee/exemptions");
    return data;
};

export const committeeExemptionDecision = async(id,payload)=>{
    const {data}=await api.put(
        `/committee/exemptions/${id}/decision`,
        payload
    );

    return data;
};