import axios from "axios";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const BASE = "http://127.0.0.1:8000/api";
const PHP = "C:\\wamp64\\bin\\php\\php8.3.28\\php.exe";
const BACKEND = "D:\\Projets\\StageLink\\backend";
const ts = Date.now();

const results = [];
let failures = 0;

function check(name, ok, extra = "") {
  results.push({ name, ok, extra });
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"} | ${name}${extra ? " | " + extra : ""}`);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function tinker(code) {
  return execFileSync(PHP, ["artisan", "tinker", "--execute=" + code], {
    cwd: BACKEND,
    encoding: "utf8",
  }).trim();
}

function signedVerifyUrl(userId, email) {
  const code = `\\Illuminate\\Support\\Facades\\URL::forceScheme('http'); \\Illuminate\\Support\\Facades\\URL::forceRootUrl('http://127.0.0.1:8000'); echo \\Illuminate\\Support\\Facades\\URL::signedRoute('verification.verify', ['id' => ${userId}, 'hash' => sha1('${email}')]);`;
  return tinker(code);
}

function pngBuffer() {
  // 1x1 transparent PNG
  return Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64"
  );
}

function pdfBuffer() {
  return Buffer.from(
    "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n",
    "utf8"
  );
}

async function api(method, url, token, data, extra = {}) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return axios({ method, url: BASE + url, data, headers, ...extra, validateStatus: () => true, maxContentLength: 50 * 1024 * 1024 });
}

async function main() {
  console.log("=== PHASE 0: Admin ===");
  const adminEmail = "admin@stagelink.fr";
  const rAdminLogin = await api("post", "/login", null, { email: adminEmail, password: "password" });
  check("admin login", rAdminLogin.status === 200, `http ${rAdminLogin.status}`);
  const adminToken = rAdminLogin.data.token;

  const rStats = await api("get", "/admin/stats", adminToken);
  check("admin stats", rStats.status === 200 && rStats.data !== null, `http ${rStats.status}`);
  const rMetrics = await api("get", "/admin/metrics/dashboard", adminToken);
  check("admin metrics", rMetrics.status === 200, `http ${rMetrics.status}`);
  const rAudit = await api("get", "/admin/audit-logs", adminToken);
  check("admin audit-log", rAudit.status === 200 && Array.isArray(rAudit.data.data), `http ${rAudit.status}`);
  const rSec = await api("get", "/admin/security/secrets-status", adminToken);
  check("admin security page", rSec.status === 200, `http ${rSec.status}`);
  const rPwd = await api("get", "/admin/password-resets", adminToken);
  check("admin password-resets", rPwd.status === 200, `http ${rPwd.status}`);
  const rUsers = await api("get", "/admin/users", adminToken);
  check("admin users list", rUsers.status === 200 && Array.isArray(rUsers.data.data), `http ${rUsers.status}`);
  const rInternships = await api("get", "/admin/internships", adminToken);
  check("admin internships list", rInternships.status === 200, `http ${rInternships.status}`);
  const rCats = await api("get", "/admin/categories", adminToken);
  check("admin categories list", rCats.status === 200, `http ${rCats.status}`);

  console.log("\n=== PHASE 1: Entreprise ===");
  const companyEmail = `company-e2e-${ts}@test.mg`;
  const rCompanyReg = await api("post", "/register", null, {
    firstname: "Test", lastname: "Entreprise", email: companyEmail,
    password: "password123", password_confirmation: "password123", role: "company",
    company_name: "E2E Entreprise", description: "Entreprise de test E2E", location: "Toliara", industry: "Technologies",
  });
  check("entreprise inscription", rCompanyReg.status === 201, `http ${rCompanyReg.status}`);
  const companyUserId = rCompanyReg.data.user.id;
  const companyRegToken = rCompanyReg.data.token;

  const companyVerifyUrl = signedVerifyUrl(companyUserId, companyEmail);
  const rCompanyVerify = await axios.get(companyVerifyUrl, { validateStatus: () => true });
  check("entreprise vérification email", rCompanyVerify.status === 200, `http ${rCompanyVerify.status}`);

  const rCompanyList = await api("get", "/admin/companies?search=" + encodeURIComponent(companyEmail), adminToken);
  const companyRow = rCompanyList.data.data.find((c) => c.user && c.user.email === companyEmail);
  check("admin trouve entreprise", !!companyRow, companyRow ? `companyId=${companyRow.id}` : "introuvable");
  const companyId = companyRow?.id;

  const rValidate = await api("post", `/admin/companies/${companyId}/validate`, adminToken);
  check("admin valide entreprise", rValidate.status === 200 && rValidate.data.company.status === "validated", `http ${rValidate.status}`);

  const rCompanyLogin = await api("post", "/login", null, { email: companyEmail, password: "password123" });
  check("entreprise connexion", rCompanyLogin.status === 200, `http ${rCompanyLogin.status}`);
  const companyToken = rCompanyLogin.data.token;

  const rCompanyProfile = await api("post", "/company/profile", companyToken, {
    description: "Entreprise E2E mise à jour", website: "https://e2e.mg",
    location: "Antananarivo", industry: "Digital", phone: "+261340000000",
  });
  check("entreprise modifie profil", rCompanyProfile.status === 200, `http ${rCompanyProfile.status}`);

  const rCatList = await api("get", "/categories", null);
  const catIds = rCatList.data.map((c) => c.id).slice(0, 2);
  const rInternshipCreate = await api("post", "/company/internships", companyToken, {
    title: `Stagiaire E2E ${ts}`,
    description: "Offre de test end-to-end pour le parcours complet.",
    requirements: "Motivation, sérieux.",
    location: "Antananarivo", type: "hybrid", duration: "3 mois", study_level: "Bac+2",
    salary: 300000, slots: 2, deadline: "2026-12-31", status: "published", categories: catIds,
  });
  check("entreprise crée offre", rInternshipCreate.status === 201, `http ${rInternshipCreate.status}`);
  const internshipId = rInternshipCreate.data.id;
  check("offre publiée", rInternshipCreate.data.status === "published", rInternshipCreate.data.status);

  console.log("\n=== PHASE 2: Étudiant ===");
  const studentEmail = `student-e2e-${ts}@test.mg`;
  const rStudentReg = await api("post", "/register", null, {
    firstname: "Feno", lastname: "Test", email: studentEmail,
    password: "password123", password_confirmation: "password123", role: "student",
  });
  check("étudiant inscription", rStudentReg.status === 201, `http ${rStudentReg.status}`);
  const studentUserId = rStudentReg.data.user.id;

  const studentVerifyUrl = signedVerifyUrl(studentUserId, studentEmail);
  const rStudentVerify = await axios.get(studentVerifyUrl, { validateStatus: () => true });
  check("étudiant vérification email", rStudentVerify.status === 200, `http ${rStudentVerify.status}`);

  const rStudentLogin = await api("post", "/login", null, { email: studentEmail, password: "password123" });
  check("étudiant connexion", rStudentLogin.status === 200, `http ${rStudentLogin.status}`);
  let studentToken = rStudentLogin.data.token;

  const rProfile0 = await api("get", "/profile", studentToken);
  check("étudiant consulte profil", rProfile0.status === 200, `http ${rProfile0.status}`);

  const rSkills = await api("get", "/skills", null);
  const skills = rSkills.data.slice(0, 2).map((s) => ({ id: s.id, level: "Intermédiaire" }));
  check("skills disponibles", skills.length === 2, `${skills.length} skills`);

  const fd = new FormData();
  fd.append("bio", "Étudiant E2E en informatique, passionné par le web.");
  fd.append("school", "Université de Toliara");
  fd.append("major", "Informatique");
  fd.append("graduation_year", "2027");
  fd.append("phone", "+261341112233");
  fd.append("languages", JSON.stringify(["Français", "Anglais"]));
  fd.append("github", "https://github.com/e2e");
  fd.append("skills[0][id]", String(skills[0].id));
  fd.append("skills[0][level]", skills[0].level);
  fd.append("skills[1][id]", String(skills[1].id));
  fd.append("skills[1][level]", skills[1].level);
  fd.append("photo", new Blob([pngBuffer()], { type: "image/png" }), "photo.png");
  fd.append("cv", new Blob([pdfBuffer()], { type: "application/pdf" }), "cv.pdf");
  const rProfileUpd = await axios.post(BASE + "/profile", fd, {
    headers: { Authorization: `Bearer ${studentToken}`, "Content-Type": "multipart/form-data" },
    validateStatus: () => true,
  });
  check("étudiant modifie profil (photo+CV+skills)", rProfileUpd.status === 200, `http ${rProfileUpd.status}`);
  check("photo uploadée", !!rProfileUpd.data.photo_url, rProfileUpd.data.photo_url || "null");
  check("CV uploadé", !!rProfileUpd.data.cv_url, rProfileUpd.data.cv_url || "null");
  check("skills enregistrées", Array.isArray(rProfileUpd.data.skills) && rProfileUpd.data.skills.length === 2, `${rProfileUpd.data.skills?.length || 0} skills`);

  const rSearch = await api("get", `/internships?q=${encodeURIComponent("Stagiaire E2E")}`, null);
  const found = (rSearch.data.data || rSearch.data).some((i) => i.id === internshipId);
  check("recherche offre", rSearch.status === 200 && found, `http ${rSearch.status}`);

  const rFav = await api("post", `/internships/${internshipId}/favorite`, studentToken);
  check("ajout favori", rFav.status === 200 && rFav.data.favorited === true, `http ${rFav.status}`);
  const rFavList = await api("get", "/favorites", studentToken);
  check("liste favoris", rFavList.status === 200 && rFavList.data.some((f) => f.internship_id === internshipId), `http ${rFavList.status}`);

  const rApply = await api("post", `/internships/${internshipId}/apply`, studentToken, {
    cover_letter: "Je suis motivé pour rejoindre votre équipe en tant que stagiaire.",
  });
  check("candidature", rApply.status === 201, `http ${rApply.status}`);
  const applicationId = rApply.data.id;
  const rApplications = await api("get", "/applications", studentToken);
  check("liste candidatures étudiant", rApplications.status === 200 && rApplications.data.some((a) => a.id === applicationId), `http ${rApplications.status}`);

  console.log("\n=== PHASE 3: Entreprise traite la candidature ===");
  const rAppsCompany = await api("get", `/company/internships/${internshipId}/applications`, companyToken);
  check("entreprise reçoit candidature", rAppsCompany.status === 200 && rAppsCompany.data.some((a) => a.id === applicationId), `http ${rAppsCompany.status}`);
  const rStudentPub = await api("get", `/students/${studentUserId}/profile`, companyToken);
  check("entreprise consulte profil étudiant", rStudentPub.status === 200, `http ${rStudentPub.status}`);

  const rAccept = await api("put", `/company/applications/${applicationId}`, companyToken, { status: "accepted" });
  check("entreprise accepte candidature", rAccept.status === 200 && rAccept.data.status === "accepted", `http ${rAccept.status}`);

  const rNotifStudent = await api("get", "/notifications", studentToken);
  check("étudiant reçoit notification acceptation", rNotifStudent.status === 200 && rNotifStudent.data.notifications.some((n) => n.title && n.title.includes("accept")), `http ${rNotifStudent.status}`);

  const rInterview = await api("post", "/company/interviews", companyToken, {
    application_id: applicationId, date: "2026-08-10T10:00:00",
    meeting_link: "https://meet.google.com/e2e-test", notes: "Entretien technique de 30 min.",
  });
  check("entreprise programme entretien", rInterview.status === 201, `http ${rInterview.status}`);
  const rInterviews = await api("get", "/interviews", studentToken);
  check("étudiant consulte entretien", rInterviews.status === 200 && rInterviews.data.some((i) => i.application_id === applicationId), `http ${rInterviews.status}`);

  const rConv = await api("post", "/conversations", companyToken, {
    recipient_id: studentUserId, message: "Bonjour, bienvenue chez nous !", internship_id: internshipId,
  });
  check("entreprise envoie message", rConv.status === 201, `http ${rConv.status}`);
  const conversationId = rConv.data.conversation.id;
  const rConvStudent = await api("get", "/conversations", studentToken);
  check("étudiant voit conversation", rConvStudent.status === 200 && rConvStudent.data.some((c) => c.id === conversationId), `http ${rConvStudent.status}`);
  const rMessages = await api("get", `/conversations/${conversationId}/messages`, studentToken);
  check("étudiant lit message", rMessages.status === 200 && rMessages.data.some((m) => m.message && m.message.includes("Bonjour")), `http ${rMessages.status}`);
  const rNotifMsg = await api("get", "/notifications", studentToken);
  check("étudiant notifié du message", rNotifMsg.status === 200 && rNotifMsg.data.notifications.some((n) => n.type && String(n.type).startsWith("message:")), `http ${rNotifMsg.status}`);

  console.log("\n=== PHASE 4: Stage + Attestation ===");
  const rStart = await api("post", `/student/internships/${internshipId}/start`, studentToken, { start_date: "2026-08-01" });
  check("démarrage stage", rStart.status === 201 && rStart.data.status === "in_progress", `http ${rStart.status}`);
  const internshipStudentId = rStart.data.id;
  const rComplete = await api("put", `/student/internship-student/${internshipStudentId}/complete`, studentToken, {
    end_date: "2026-08-31", feedback: "Excellente expérience, équipe accueillante.",
  });
  check("fin de stage", rComplete.status === 200 && rComplete.data.status === "completed", `http ${rComplete.status}`);
  const rAttestation = await api("get", `/student/internship-student/${internshipStudentId}/attestation`, studentToken, null, { responseType: "arraybuffer" });
  const isPdf = rAttestation.headers["content-type"] && rAttestation.headers["content-type"].includes("application/pdf");
  check("attestation PDF", rAttestation.status === 200 && isPdf && rAttestation.data.byteLength > 100, `http ${rAttestation.status} ${rAttestation.data.byteLength}o`);

  const rCsv = await api("get", `/company/internships/${internshipId}/applications/export`, companyToken, null, { responseType: "arraybuffer" });
  const csvText = Buffer.from(rCsv.data).toString("utf8");
  check("export CSV candidatures", rCsv.status === 200 && csvText.includes("Candidatures pour"), `http ${rCsv.status}`);

  const rGdpr = await api("get", "/gdpr/export", studentToken);
  check("export GDPR", rGdpr.status === 200, `http ${rGdpr.status}`);

  console.log("\n=== PHASE 5: Mot de passe oublié ===");
  const rForgot = await api("post", "/forgot-password", null, { email: studentEmail });
  check("mot de passe oublié", rForgot.status === 200, `http ${rForgot.status}`);
  const resetPlain = "newpassword456";
  tinker(`DB::table('password_reset_tokens')->updateOrInsert(['email' => '${studentEmail}'], ['token' => bcrypt('${resetPlain}'), 'created_at' => now()]); echo 'OK';`);
  const rReset = await api("post", "/reset-password", null, {
    email: studentEmail, token: resetPlain, password: "newpassword456", password_confirmation: "newpassword456",
  });
  check("réinitialisation mot de passe", rReset.status === 200, `http ${rReset.status}`);
  const rRelogin = await api("post", "/login", null, { email: studentEmail, password: "newpassword456" });
  check("reconnexion avec nouveau mot de passe", rRelogin.status === 200, `http ${rRelogin.status}`);
  studentToken = rRelogin.data.token;

  console.log("\n=== PHASE 6: Gouvernance admin ===");
  const rBan = await api("post", `/admin/users/${companyUserId}/ban`, adminToken);
  check("admin suspend utilisateur", rBan.status === 200, `http ${rBan.status}`);
  const rUnban = await api("post", `/admin/users/${companyUserId}/unban`, adminToken);
  check("admin réactive utilisateur", rUnban.status === 200, `http ${rUnban.status}`);

  const rCatCreate = await api("post", "/admin/categories", adminToken, { name: `E2E Cat ${ts}`, slug: `e2e-cat-${ts}` });
  check("admin crée catégorie", rCatCreate.status === 201, `http ${rCatCreate.status}`);
  const newCatId = rCatCreate.data.id;
  const rCatDelete = await api("delete", `/admin/categories/${newCatId}`, adminToken);
  check("admin supprime catégorie", rCatDelete.status === 200, `http ${rCatDelete.status}`);

  const communeId = tinker("echo App\\Models\\Commune::value('id');");
  const rNeigh = await api("post", "/neighborhoods", studentToken, { commune_id: Number(communeId), name: `Quartier E2E ${ts}` });
  check("étudiant propose quartier", rNeigh.status === 201, `http ${rNeigh.status}`);
  const neighborhoodId = rNeigh.data.neighborhood.id;
  const rPending = await api("get", "/admin/neighborhoods/pending", adminToken);
  check("admin voit quartier en attente", rPending.status === 200 && rPending.data.data.some((n) => n.id === neighborhoodId), `http ${rPending.status}`);
  const rApprove = await api("post", `/admin/neighborhoods/${neighborhoodId}/approve`, adminToken);
  check("admin valide quartier", rApprove.status === 200 && rApprove.data.neighborhood.status === "approved", `http ${rApprove.status}`);

  const rSuspend = await api("post", `/admin/companies/${companyId}/suspend`, adminToken);
  check("admin suspend entreprise", rSuspend.status === 200 && rSuspend.data.company.status === "suspended", `http ${rSuspend.status}`);
  const rReactivate = await api("post", `/admin/companies/${companyId}/reactivate`, adminToken);
  check("admin réactive entreprise", rReactivate.status === 200 && rReactivate.data.company.status === "validated", `http ${rReactivate.status}`);

  console.log("\n=== RÉSUMÉ ===");
  console.log(`${results.length - failures}/${results.length} étapes réussies`);
  results.forEach((r) => {
    if (!r.ok) console.log(`  ÉCHEC: ${r.name}${r.extra ? " | " + r.extra : ""}`);
  });
  process.exit(failures ? 1 : 0);
}

main().catch((e) => {
  console.error("Erreur fatale E2E:", e);
  process.exit(1);
});
