import React, { useState } from "react";
import { useWorkshop } from "../context/WorkshopContext.jsx";
import { registrarUsuario } from "../services/n8nBackendService.js";
import "./UsuariosView.css";
import { useTranslation } from "react-i18next";
import { useFocusTrap } from "../hooks/useFocusTrap.js";

const EMPTY_USER = { nombre: "", usuario: "", email: "", telefono: "", password: "", rol: "tecnico", roles: ["ver_ordenes", "crear_orden"] };
const PERMISSION_GROUPS = [
  { title: "users.workshopOps", permissions: [["ver_ordenes", "users.viewOrders"], ["crear_orden", "users.createOrder"], ["crear_cotizacion", "users.createQuote"], ["cambiar_estado_orden", "users.changeStatus"]] },
  { title: "users.administration", permissions: [["gestionar_usuarios", "users.manageUsers"]] },
];
const initials = (name = "") => name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "US";

export default function UsuariosView() {
  const { t } = useTranslation();
  const permissionLabels = Object.fromEntries(PERMISSION_GROUPS.flatMap((group) => group.permissions.map(([id, label]) => [id, t(label)])));
  const { usuarios, addUsuario, updateUsuario, deleteUsuario } = useWorkshop();
  const [form, setForm] = useState(EMPTY_USER);
  const [message, setMessage] = useState("");
  const [userToDelete, setUserToDelete] = useState(null);
  const [toast, setToast] = useState("");

  const togglePermission = (permission) => setForm((current) => ({ ...current, roles: current.roles.includes(permission) ? current.roles.filter((item) => item !== permission) : [...current.roles, permission] }));
  async function saveUser(event) {
    event.preventDefault();
    if (!form.nombre.trim() || !form.usuario.trim() || !form.password) return;
    try {
      const remote = await registrarUsuario(form);
      if (!remote.ok && !remote.demo) throw new Error(remote.error || "n8n no pudo registrar el usuario.");
      const result = await addUsuario(form);
      if (result?.error) return setMessage(result.error);
      setForm(EMPTY_USER); setMessage(t("users.added"));
    } catch (error) { setMessage(error.message || t("users.addError")); }
  }
  async function changeUserRole(id, rol) { try { const result = await updateUsuario(id, { rol }); setMessage(result?.error || t("users.roleUpdated")); } catch (error) { setMessage(error.message || t("users.roleError")); } }
  function removeUser(user) {
    if (user.usuario === "admin" || user.nombre === "Administrador") {
      setToast(t("users.denied"));
      window.setTimeout(() => setToast(""), 3500);
      return;
    }
    setUserToDelete(user);
  }
  async function confirmRemoveUser() {
    if (!userToDelete) return;
    try {
      await deleteUsuario(userToDelete.id);
      setUserToDelete(null); setToast(t("users.deleted"));
      window.setTimeout(() => setToast(""), 3000);
    } catch (error) { setUserToDelete(null); setToast(error.message || t("users.deleteError")); window.setTimeout(() => setToast(""), 3500); }
  }

  return <div className="page-container users-page">
    <div className="breadcrumb-nav"><span>{t("common.home")}</span><span>/</span><span className="breadcrumb-current">{t("users.title")}</span></div>
    <header className="users-header"><div><h1>{t("users.title")}</h1><p>{t("users.subtitle")}</p></div></header>
    <section className="users-layout">
      <form className="user-form" onSubmit={saveUser}>
        <div><h2>{t("users.add")}</h2><p className="form-intro">{t("users.addSubtitle")}</p></div>
        <div className="user-fields-grid">
          <label>{t("users.fullName")}<input value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })} required /></label>
          <label>{t("users.username")}<input value={form.usuario} onChange={(event) => setForm({ ...form, usuario: event.target.value })} required /></label>
          <label>{t("users.email")}<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label>
          <label>{t("users.phone")}<input type="tel" value={form.telefono} onChange={(event) => setForm({ ...form, telefono: event.target.value })} required /></label>
          <label>{t("users.password")}<input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required /></label>
          <label>{t("users.type")}<select value={form.rol} onChange={(event) => setForm({ ...form, rol: event.target.value })}><option value="tecnico">{t("users.technician")}</option><option value="admin">{t("users.admin")}</option></select></label>
        </div>
        <div className="permissions-section"><h3>{t("users.permissions")}</h3><div className="permission-groups">{PERMISSION_GROUPS.map((group) => <fieldset className="permission-group" key={group.title}><legend>{t(group.title)}</legend>{group.permissions.map(([id, label, help]) => <label className="permission-check" key={id}><input type="checkbox" checked={form.roles.includes(id)} onChange={() => togglePermission(id)} /><span><b>{t(label)}</b>{help && <small title={help}>{help}</small>}</span></label>)}</fieldset>)}</div></div>
        {message && <p className="user-message" role="status">{message}</p>}
        <button className="btn-primary" type="submit">{t("users.save")}</button>
      </form>
      <section className="user-list"><div className="user-list-heading"><div><h2>{t("users.registered")}</h2><p>{t("users.memberCount", { count: usuarios.length })}</p></div></div>{usuarios.map((user) => { const isRootAdmin = user.usuario === "admin" || user.nombre === "Administrador"; return <article key={user.id} className="user-item"><div className="user-avatar">{initials(user.nombre)}</div><div className="user-info"><div className="user-name-row"><strong>{user.nombre}</strong><span className={`role-badge ${user.rol === "admin" ? "admin" : "tecnico"}`}>{user.rol === "admin" ? t("users.admin") : t("users.technician")}</span></div><small>@{user.usuario} · {user.email || t("users.noEmail")}</small><div className="permission-tags">{(user.roles || []).length ? user.roles.map((role) => <span key={role}>{permissionLabels[role] || role.replace(/_/g, " ")}</span>) : <em>{t("users.noPermissions")}</em>}</div></div><div className="user-actions"><label>{t("common.role")}<select value={user.rol} onChange={(event) => changeUserRole(user.id, event.target.value)}><option value="tecnico">{t("users.technician")}</option><option value="admin">{t("users.admin")}</option></select></label><button type="button" disabled={isRootAdmin} onClick={() => removeUser(user)} title={isRootAdmin ? t("users.protected") : t("users.delete")} aria-label={`${t("users.delete")} ${user.usuario}`}>×</button></div></article>; })}</section>
    </section>
    {userToDelete && <DeleteUserDialog user={userToDelete} onClose={() => setUserToDelete(null)} onConfirm={confirmRemoveUser} />}
    {toast && <div role="status" aria-live="polite" aria-atomic="true" className={`user-toast ${toast === t("users.deleted") ? "success" : "error"}`}><span aria-hidden="true">{toast === t("users.deleted") ? "✓ " : "! "}</span>{toast}</div>}
  </div>;
}

function DeleteUserDialog({ user, onClose, onConfirm }) {
  const { t } = useTranslation();
  const dialogRef = useFocusTrap(true, onClose);
  return <div className="user-delete-backdrop" onMouseDown={onClose}><section ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="delete-user-title" onMouseDown={(event) => event.stopPropagation()} className="user-delete-dialog"><h2 id="delete-user-title">{t("users.deleteTitle")}</h2><p>{t("users.deleteBody")}</p><div><button type="button" onClick={onClose}>{t("common.cancel")}</button><button type="button" onClick={onConfirm}>{t("common.delete")}</button></div></section></div>;
}
