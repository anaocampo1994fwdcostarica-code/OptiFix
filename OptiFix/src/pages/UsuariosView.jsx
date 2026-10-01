import React, { useState } from "react";
import { useWorkshop } from "../context/WorkshopContext.jsx";
import { registrarUsuario } from "../services/n8nBackendService.js";
import "./UsuariosView.css";

const EMPTY_USER = { nombre: "", usuario: "", email: "", telefono: "", password: "", rol: "tecnico", roles: ["ver_ordenes", "crear_orden"] };
const PERMISSION_GROUPS = [
  { title: "Operativa de Taller", permissions: [["ver_ordenes", "Ver órdenes"], ["crear_orden", "Crear nueva orden"], ["crear_cotizacion", "Crear cotización"], ["cambiar_estado_orden", "Cambiar estado de orden"]] },
  { title: "Administración", permissions: [["gestionar_usuarios", "Gestionar usuarios"]] },
];
const permissionLabels = Object.fromEntries(PERMISSION_GROUPS.flatMap((group) => group.permissions.map(([id, label]) => [id, label])));
const initials = (name = "") => name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "US";

export default function UsuariosView() {
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
      setForm(EMPTY_USER); setMessage("Usuario agregado correctamente.");
    } catch (error) { setMessage(error.message || "No se pudo registrar el usuario."); }
  }
  async function changeUserRole(id, rol) { try { const result = await updateUsuario(id, { rol }); setMessage(result?.error || "Rol actualizado correctamente."); } catch (error) { setMessage(error.message || "No se pudo actualizar el rol."); } }
  function removeUser(user) {
    if (user.usuario === "admin" || user.nombre === "Administrador") {
      setToast("Acción denegada: No se puede eliminar al administrador principal del sistema.");
      window.setTimeout(() => setToast(""), 3500);
      return;
    }
    setUserToDelete(user);
  }
  async function confirmRemoveUser() {
    if (!userToDelete) return;
    try {
      await deleteUsuario(userToDelete.id);
      setUserToDelete(null); setToast("Usuario eliminado correctamente");
      window.setTimeout(() => setToast(""), 3000);
    } catch (error) { setUserToDelete(null); setToast(error.message || "No se pudo eliminar el usuario."); window.setTimeout(() => setToast(""), 3500); }
  }

  return <div className="page-container users-page">
    <div className="breadcrumb-nav"><span>Principal</span><span>/</span><span className="breadcrumb-current">Usuarios y permisos</span></div>
    <header className="users-header"><div><h1>Usuarios y permisos</h1><p>Administra el acceso operativo del equipo de OptiFix.</p></div></header>
    <section className="users-layout">
      <form className="user-form" onSubmit={saveUser}>
        <div><h2>Agregar usuario</h2><p className="form-intro">Definí el acceso y las responsabilidades de cada integrante.</p></div>
        <div className="user-fields-grid">
          <label>Nombre completo<input value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })} required /></label>
          <label>Usuario<input value={form.usuario} onChange={(event) => setForm({ ...form, usuario: event.target.value })} required /></label>
          <label>Correo electrónico<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label>
          <label>Teléfono<input type="tel" value={form.telefono} onChange={(event) => setForm({ ...form, telefono: event.target.value })} required /></label>
          <label>Contraseña<input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required /></label>
          <label>Tipo de usuario<select value={form.rol} onChange={(event) => setForm({ ...form, rol: event.target.value })}><option value="tecnico">Técnico</option><option value="admin">Administrador</option></select></label>
        </div>
        <div className="permissions-section"><h3>Permisos</h3><div className="permission-groups">{PERMISSION_GROUPS.map((group) => <fieldset className="permission-group" key={group.title}><legend>{group.title}</legend>{group.permissions.map(([id, label, help]) => <label className="permission-check" key={id}><input type="checkbox" checked={form.roles.includes(id)} onChange={() => togglePermission(id)} /><span><b>{label}</b>{help && <small title={help}>{help}</small>}</span></label>)}</fieldset>)}</div></div>
        {message && <p className="user-message" role="status">{message}</p>}
        <button className="btn-primary" type="submit">Guardar usuario</button>
      </form>
      <section className="user-list"><div className="user-list-heading"><div><h2>Usuarios registrados</h2><p>{usuarios.length} miembros con acceso al taller.</p></div></div>{usuarios.map((user) => { const isRootAdmin = user.usuario === "admin" || user.nombre === "Administrador"; return <article key={user.id} className="user-item"><div className="user-avatar">{initials(user.nombre)}</div><div className="user-info"><div className="user-name-row"><strong>{user.nombre}</strong><span className={`role-badge ${user.rol === "admin" ? "admin" : "tecnico"}`}>{user.rol === "admin" ? "Administrador" : "Técnico"}</span></div><small>@{user.usuario} · {user.email || "Sin correo"}</small><div className="permission-tags">{(user.roles || []).length ? user.roles.map((role) => <span key={role}>{permissionLabels[role] || role.replace(/_/g, " ")}</span>) : <em>Sin permisos asignados</em>}</div></div><div className="user-actions"><label>Rol<select value={user.rol} onChange={(event) => changeUserRole(user.id, event.target.value)}><option value="tecnico">Técnico</option><option value="admin">Administrador</option></select></label><button type="button" disabled={isRootAdmin} onClick={() => removeUser(user)} title={isRootAdmin ? "No se puede eliminar al administrador principal" : "Eliminar usuario"} aria-label={`Eliminar usuario ${user.usuario}`}>×</button></div></article>; })}</section>
    </section>
    {userToDelete && <DeleteUserDialog user={userToDelete} onClose={() => setUserToDelete(null)} onConfirm={confirmRemoveUser} />}
    {toast && <div role="status" className={`user-toast ${toast.startsWith("Usuario eliminado") ? "success" : "error"}`}>{toast}</div>}
  </div>;
}

function DeleteUserDialog({ user, onClose, onConfirm }) {
  return <div className="user-delete-backdrop" onMouseDown={onClose}><section role="dialog" aria-modal="true" aria-labelledby="delete-user-title" onMouseDown={(event) => event.stopPropagation()} className="user-delete-dialog"><h2 id="delete-user-title">¿Eliminar usuario?</h2><p>¿Estás seguro de que deseas revocar el acceso a este usuario? Ya no podrá ingresar al sistema.</p><div><button type="button" onClick={onClose}>Cancelar</button><button type="button" onClick={onConfirm}>Eliminar</button></div></section></div>;
}
