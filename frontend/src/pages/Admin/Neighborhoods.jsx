import { useState, useEffect, useRef } from "react";
import { Check, X, MapPin, Loader } from "lucide-react";
import { locationService } from "../../services/locationService";
import { getErrorMessage } from "../../services/api";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import toast from "react-hot-toast";

export default function AdminNeighborhoods() {
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const prevCountRef = useRef(0);

  const load = (silent = false) => {
    if (!silent) { setLoading(true); setError(null); }
    locationService.getPendingNeighborhoods()
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        if (silent && prevCountRef.current > 0 && arr.length > prevCountRef.current) {
          toast.success(`${arr.length - prevCountRef.current} nouveau(x) quartier(s) à valider !`, { duration: 5000 });
        }
        prevCountRef.current = arr.length;
        setNeighborhoods(arr);
      })
      .catch((err) => { if (!silent) setError(getErrorMessage(err)); })
      .finally(() => { if (!silent) setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  // Poll every 8 seconds
  useEffect(() => {
    const id = setInterval(() => load(true), 8000);
    return () => clearInterval(id);
  }, []);

  const handleApprove = async (id) => {
    try {
      await locationService.approveNeighborhood(id);
      toast.success("Quartier approuvé !");
      prevCountRef.current = Math.max(0, prevCountRef.current - 1);
      setNeighborhoods((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleReject = async (id) => {
    try {
      await locationService.rejectNeighborhood(id);
      toast.success("Quartier refusé.");
      prevCountRef.current = Math.max(0, prevCountRef.current - 1);
      setNeighborhoods((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader className="animate-spin h-8 w-8 text-primary" /></div>;
  if (error) return <div className="text-center py-12 text-danger"><p>{error}</p><Button onClick={() => load()} className="mt-4">Réessayer</Button></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Validations des quartiers</h1>
        <div className="flex items-center gap-2">
          {neighborhoods.length > 0 && (
            <span className="text-xs text-text-muted animate-pulse">● temps réel</span>
          )}
          <Button variant="secondary" size="sm" onClick={() => load()}>Actualiser</Button>
        </div>
      </div>

      {neighborhoods.length === 0 ? (
        <EmptyState icon={MapPin} title="Aucune proposition en attente" description="Tous les quartiers proposés ont été traités." />
      ) : (
        <div className="space-y-3">
          {neighborhoods.map((n) => (
            <Card key={n.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <MapPin size={18} className="text-primary" />
                    {n.name}
                  </h3>
                  <p className="text-sm text-text-muted mt-1">
                    Commune : {n.commune?.name} — {n.commune?.district?.name} — {n.commune?.district?.region?.name} — {n.commune?.district?.region?.province?.name}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    Proposé par {n.creator?.name || "Anonyme"} — {new Date(n.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button size="sm" onClick={() => handleApprove(n.id)}>
                    <Check size={16} className="mr-1" /> Accepter
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleReject(n.id)}>
                    <X size={16} className="mr-1" /> Refuser
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
