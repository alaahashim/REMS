import axios from "axios";
const API = "http://localhost:5179/api/properties";

export const getProperties = async () => {
  const res = await axios.get(API);
  return res.data;
};

export const getPropertyById = async (id) => {
  const res = await axios.get(`${API}/${id}`);
  return res.data;
};

export const createProperty = async (
  propertyData,
  units
) => {

  const unitsDto = units.map((u, index) => ({
    propertyId: 0,
    unitNumber: `${index + 1}`,
    floor: Number(u.floor),
    area: Number(u.area),

    usageType: u.usage,

    finishingType: "Finished",

    unitType: u.unitType,

    status: "Active"
  }));

  const dto = {
    governorateId: propertyData.governorateId,
    centerId: propertyData.centerId,
    neighborhoodId: propertyData.neighborhoodId,
    streetId: propertyData.streetId,
    buildingNo: propertyData.buildingNo,

    currentPropertyNo: "",

    oldPropertyNo: "",

    planningNo: "",

    buildYear: new Date().getFullYear(),

    description: propertyData.description,

    units: unitsDto
  };

  const res = await axios.post(
    API,
    dto
  );

  return res.data;
};

export const updateProperty = async (
  id,
  data
) => {
  const res = await axios.put(
    `${API}/${id}`,
    data
  );

  return res.data;
};

export const deleteProperty = async (
  propertyId
) => {
  await axios.delete(
    `${API}/${propertyId}`
  );
};

export const getUnits = async (
  propertyId = null
) => {
  const res = await axios.get(
    `${API}/units`,
    {
      params: { propertyId }
    }
  );

  return res.data;
};

export const createUnit = async (
  unitData
) => {
  const res = await axios.post(
    `${API}/unit`,
    unitData
  );

  return res.data;
};

export const updateUnitData = async (
  unitId,
  unitData
) => {
  const res = await axios.put(
    `${API}/unit/${unitId}`,
    unitData
  );

  return res.data;
};

export const deleteUnit = async (
  unitId
) => {
  await axios.delete(
    `${API}/unit/${unitId}`
  );
};

export const updatePropertyStatus =
  async (propertyId, status) => {

    await axios.put(
      `${API}/${propertyId}/status`,
      {
        status
      }
    );
  };

export const updateUnitStatus =
  async (unitId, status) => {

    await axios.put(
      `${API}/unit/${unitId}/status`,
      {
        status
      }
    );
  };
  
  /////////////////////////////////////////////////////////////////
  // سيتم استخدامها بعد ربط المالك بالعقار

export const getEnrichedUnits =
async () => {

  throw new Error(
    'getEnrichedUnits غير متاحة حالياً. سيتم تفعيلها بعد تنفيذ Owner Feature.'
  );

};