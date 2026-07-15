import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminService } from "../../services/adminService";
import { getErrorMessage } from "../../services/api";
import { GraduationCap, Search, Eye, FileText, Mail, Phone, Calendar, XCircle } from "lucide-react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";
import toast from "react-hot-toast";

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("created_at");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getStudents({ search, sort, order, page, per_page: 15 });
      if (res.data) {
        setStudents(res.data);
        setTotalPages(res.last_page || 1);
      } else {
        setStudents(res);
        setTotalPages(1);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, [page, sort, order]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const handleSortChange = (e) => {
    const val = e.target.value;
    if (val === "newest") { setSort("created_at"); setOrder("desc"); }
    else if (val === "oldest") { setSort("created_at"); setOrder("asc"); }
    else if (val === "name_asc") { setSort("name"); setOrder("asc"); }
    else if (val === "name_desc") { setSort("name"); setOrder("desc"); }
    setPage(1);
  };

  if (loading && students.length === 0)
    return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (error && students.length === 0)
    return <div className="text-center py-12 text-danger"><p>{error}</p><button onClick={fetchStudents} className="mt-4 text-primary underline cursor-pointer">Réessayer</button></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Étudiants</h1>
        <p className="text-text-muted text-sm">Gérez les profils étudiants</p>
      </div>

      <form onSubmit={handleSearch} className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <Button type="submit" size="sm">Rechercher</Button>
        {search && (
          <Button type="button" size="sm" variant="ghost" onClick={() => { setSearch(""); setPage(1); }}>
            <XCircle size={16} />
          </Button>
        )}
        <select
          value={order === "desc" && sort === "created_at" ? "newest" : order === "asc" && sort === "created_at" ? "oldest" : order === "asc" && sort === "name" ? "name_asc" : "name_desc"}
          onChange={handleSortChange}
          className="px-3 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="newest">Plus récents</option>
          <option value="oldest">Plus anciens</option>
          <option value="name_asc">Nom A-Z</option>
          <option value="name_desc">Nom Z-A</option>
        </select>
      </form>

      {students.length === 0 ? (
        <EmptyState icon={GraduationCap} title="Aucun étudiant" description="Aucun étudiant inscrit pour le moment" />
      ) : (
        <>
          <div className="space-y-3">
            {students.map((student) => (
              <Card key={student.id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {student.profile?.photo ? (
                      <img src={student.profile.photo} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary-bg flex items-center justify-center">
                        <GraduationCap size={18} className="text-primary" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{student.name}</h3>
                        {student.banned_at ? <Badge variant="rejected">Banni</Badge> : <Badge variant="open">Actif</Badge>}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-text-muted mt-0.5">
                        <span className="flex items-center gap-1"><Mail size={14} />{student.email}</span>
                        {student.phone && <span className="flex items-center gap-1"><Phone size={14} />{student.phone}</span>}
                        {student.applications_count > 0 && <span className="flex items-center gap-1"><FileText size={14} />{student.applications_count} candidature{student.applications_count > 1 ? "s" : ""}</span>}
                        <span className="flex items-center gap-1"><Calendar size={14} />Inscrit le {new Date(student.created_at).toLocaleDateString("fr-FR")}</span>
                      </div>
                    </div>
                  </div>
                  <Link to={`/admin/students/${student.id}`} className="shrink-0">
                    <Button variant="outline" size="sm"><Eye size={16} />Voir profil</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
