import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { locationService } from "../../services/locationService";
import { getErrorMessage } from "../../services/api";
import Button from "./Button";
import { Plus, Loader } from "lucide-react";
import toast from "react-hot-toast";

export default function LocationSelector({ communeId, neighborhoodId, onChange }) {
  const { t } = useTranslation();
  const [countries, setCountries] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [regions, setRegions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedCommune, setSelectedCommune] = useState(communeId || "");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(neighborhoodId || "");

  const [proposing, setProposing] = useState(false);
  const [newNeighborhood, setNewNeighborhood] = useState("");
  const [error, setError] = useState("");

  const handleError = useCallback((err) => {
    setError(getErrorMessage(err) || "Impossible de charger la localisation.");
  }, []);

  useEffect(() => {
    setError("");
    locationService.getCountries().then(setCountries).catch(handleError);
  }, [handleError]);

  // Restore full hierarchy when communeId changes (profile loaded)
  useEffect(() => {
    if (!communeId) return;
    setError("");
    locationService.getCommuneHierarchy(communeId).then((h) => {
      if (!h) return;
      if (h.country) { setSelectedCountry(h.country.id); locationService.getProvinces(h.country.id).then(setProvinces).catch(handleError); }
      if (h.province) { setSelectedProvince(h.province.id); locationService.getRegions(h.province.id).then(setRegions).catch(handleError); }
      if (h.region) { setSelectedRegion(h.region.id); locationService.getDistricts(h.region.id).then(setDistricts).catch(handleError); }
      if (h.district) { setSelectedDistrict(h.district.id); locationService.getCommunes(h.district.id).then(setCommunes).catch(handleError); }
      setSelectedCommune(communeId);
      locationService.getNeighborhoods(communeId).then(setNeighborhoods).catch(handleError);
    }).catch(handleError);
  }, [communeId, handleError]);

  // Sync neighborhoodId prop
  useEffect(() => {
    setSelectedNeighborhood(neighborhoodId || "");
  }, [neighborhoodId]);

  const fetchProvinces = useCallback((countryId) => {
    setSelectedProvince(""); setSelectedRegion(""); setSelectedDistrict(""); setSelectedCommune(""); setSelectedNeighborhood("");
    setProvinces([]); setRegions([]); setDistricts([]); setCommunes([]); setNeighborhoods([]);
    setError("");
    onChange({ commune_id: null, neighborhood_id: null });
    if (!countryId) return;
    locationService.getProvinces(countryId).then(setProvinces).catch(handleError);
  }, [onChange, handleError]);

  const fetchRegions = useCallback((provinceId) => {
    setSelectedRegion(""); setSelectedDistrict(""); setSelectedCommune(""); setSelectedNeighborhood("");
    setRegions([]); setDistricts([]); setCommunes([]); setNeighborhoods([]);
    setError("");
    onChange({ commune_id: null, neighborhood_id: null });
    if (!provinceId) return;
    locationService.getRegions(provinceId).then(setRegions).catch(handleError);
  }, [onChange, handleError]);

  const fetchDistricts = useCallback((regionId) => {
    setSelectedDistrict(""); setSelectedCommune(""); setSelectedNeighborhood("");
    setDistricts([]); setCommunes([]); setNeighborhoods([]);
    setError("");
    onChange({ commune_id: null, neighborhood_id: null });
    if (!regionId) return;
    locationService.getDistricts(regionId).then(setDistricts).catch(handleError);
  }, [onChange, handleError]);

  const fetchCommunes = useCallback((districtId) => {
    setSelectedCommune(""); setSelectedNeighborhood("");
    setCommunes([]); setNeighborhoods([]);
    setError("");
    onChange({ commune_id: null, neighborhood_id: null });
    if (!districtId) return;
    locationService.getCommunes(districtId).then(setCommunes).catch(handleError);
  }, [onChange, handleError]);

  const fetchNeighborhoods = useCallback((communeId) => {
    setSelectedNeighborhood("");
    setNeighborhoods([]);
    setError("");
    onChange({ commune_id: communeId || null, neighborhood_id: null });
    if (!communeId) return;
    locationService.getNeighborhoods(communeId).then(setNeighborhoods).catch(handleError);
  }, [onChange, handleError]);

  const handlePropose = async () => {
    if (!newNeighborhood.trim()) return;
    setProposing(true);
    try {
      const res = await locationService.proposeNeighborhood(selectedCommune, newNeighborhood.trim());
      const nb = res.neighborhood || res.data?.neighborhood;
      if (nb?.id) {
        setNeighborhoods((prev) => [...prev, { id: nb.id, name: nb.name + " (en attente)" }]);
        setSelectedNeighborhood(nb.id);
        onChange({ commune_id: selectedCommune, neighborhood_id: nb.id });
      }
      toast.success("Votre quartier a été proposé. En attente de validation.");
      setNewNeighborhood("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de la proposition");
    } finally {
      setProposing(false);
    }
  };

  const selectClass = "w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer";
  const labelClass = "block text-sm font-medium mb-1";

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-text-muted">{t("studentProfile.youAreAt")}</p>
      {error && <p className="text-sm text-danger" role="alert">{error}</p>}

      <div>
        <label className={labelClass}>{t("studentProfile.country")}</label>
        <select className={selectClass} value={selectedCountry} onChange={(e) => { setSelectedCountry(e.target.value); fetchProvinces(e.target.value); }}>
          <option value="">— {t("studentProfile.levelSelect")} —</option>
          {countries.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {selectedCountry && (
        <div>
          <label className={labelClass}>{t("studentProfile.province")}</label>
          <select className={selectClass} value={selectedProvince} onChange={(e) => { setSelectedProvince(e.target.value); fetchRegions(e.target.value); }}>
            <option value="">— {t("studentProfile.levelSelect")} —</option>
            {provinces.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      )}

      {selectedProvince && (
        <div>
          <label className={labelClass}>{t("studentProfile.region")}</label>
          <select className={selectClass} value={selectedRegion} onChange={(e) => { setSelectedRegion(e.target.value); fetchDistricts(e.target.value); }}>
            <option value="">— {t("studentProfile.levelSelect")} —</option>
            {regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
      )}

      {selectedRegion && (
        <div>
          <label className={labelClass}>{t("studentProfile.district")}</label>
          <select className={selectClass} value={selectedDistrict} onChange={(e) => { setSelectedDistrict(e.target.value); fetchCommunes(e.target.value); }}>
            <option value="">— {t("studentProfile.levelSelect")} —</option>
            {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
      )}

      {selectedDistrict && (
        <div>
          <label className={labelClass}>{t("studentProfile.commune")}</label>
          <select className={selectClass} value={selectedCommune} onChange={(e) => { setSelectedCommune(e.target.value); fetchNeighborhoods(e.target.value); }}>
            <option value="">— {t("studentProfile.levelSelect")} —</option>
            {communes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}

      {selectedCommune && (
        <div>
          <label className={labelClass}>{t("studentProfile.neighborhood")}</label>
          <select className={selectClass} value={selectedNeighborhood} onChange={(e) => { setSelectedNeighborhood(e.target.value); onChange({ commune_id: selectedCommune, neighborhood_id: e.target.value || null }); }}>
            <option value="">— {t("studentProfile.levelSelect")} —</option>
            {neighborhoods.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
          </select>

          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-700 font-medium mb-2">{t("studentProfile.neighborhoodPropose")}</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={t("studentProfile.neighborhoodName")}
                value={newNeighborhood}
                onChange={(e) => setNewNeighborhood(e.target.value)}
                className="flex-1 px-3 py-1.5 text-sm border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
              />
              <Button size="sm" onClick={handlePropose} loading={proposing} disabled={!newNeighborhood.trim()}>
                <Plus size={14} className="mr-1" /> {t("studentProfile.neighborhoodAdd")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
