// src/services/locationService.js

const GOVERNORATES = [
  { id: 1, name: 'القاهرة' },
  { id: 2, name: 'الجيزة' },
  { id: 3, name: 'الإسكندرية' }
];

const API_URL = "http://localhost:5179/api/Locations";

// لاحظ أن centerId يجب أن يطابق ID المركز
const STREETS = [
  { id: 1, centerId: 1, name: 'شارع عباس العقاد' },
  { id: 2, centerId: 1, name: 'شارع خير الله' },
  { id: 3, centerId: 2, name: 'التسعين الشمالي' },
  { id: 4, centerId: 3, name: 'شارع لبنان' }
];

const NEIGHBORHOODS = [
  { id: 1, centerId: 1, name: 'الحي السكني الأول', zone: 'A' },
  { id: 2, centerId: 1, name: 'الحي التجاري', zone: 'B' },
  { id: 3, centerId: 2, name: 'الحي الإداري', zone: 'A' },
  { id: 4, centerId: 2, name: 'المنطقة السكنية', zone: 'C' },
  { id: 5, centerId: 3, name: 'الحي التاريخي', zone: 'B' },
  { id: 6, centerId: 4, name: 'المنطقة الصناعية', zone: 'A' }
];

const findById = (collection, id) => collection.find(item => item.id === Number(id)) || null;

export const getGovernorates = () => Promise.resolve(GOVERNORATES);
export const getCenters = (govId) => Promise.resolve(CENTERS.filter(c => c.govId === Number(govId)));
export const getStreets = (centerId) => Promise.resolve(STREETS.filter(s => s.centerId === Number(centerId)));
export const getNeighborhoods = (centerId) => Promise.resolve(NEIGHBORHOODS.filter(n => n.centerId === Number(centerId)));

export const getGovernorateById = (id) => findById(GOVERNORATES, id);
export const getCenterById = (id) => findById(CENTERS, id);
export const getStreetById = (id) => findById(STREETS, id);
export const getNeighborhoodById = (id) => findById(NEIGHBORHOODS, id);

export const getLocationLabel = ({ governorateId, centerId, streetId, neighborhoodId }) => {
  const gov = getGovernorateById(governorateId)?.name;
  const center = getCenterById(centerId)?.name;
  const street = getStreetById(streetId)?.name;
  const neighborhood = getNeighborhoodById(neighborhoodId)?.name;
  return [gov, center, neighborhood, street].filter(Boolean).join(' - ');
};