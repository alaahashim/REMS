import api from "./apiClient";

export const getManagerAppeals = async () => {
    const { data } = await api.get("/manager/appeals");
    return data;
};

export const managerAppealDecision = async (id, body) => {
    const { data } = await api.post(
        `/manager/appeals/${id}/decision`,
        body
    );

    return data;
};

export const getManagerExemptions = async () => {
    const { data } = await api.get("/manager/exemptions");
    return data;
};

export const managerExemptionDecision = async (id, body) => {
    const { data } = await api.post(
        `/manager/exemptions/${id}/decision`,
        body
    );

    return data;
};