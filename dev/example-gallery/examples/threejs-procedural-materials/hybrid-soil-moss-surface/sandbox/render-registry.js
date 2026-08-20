/** Scene projection registry. It deliberately contains no world mutation logic. */
export function createRenderRegistry() {
  const byId = new Map();
  return {
    set(id, object) { byId.set(id, object); return object; },
    get(id) { return byId.get(id) || null; },
    has(id) { return byId.has(id); },
    delete(id) { return byId.delete(id); },
    clear() { byId.clear(); },
    ids() { return [...byId.keys()]; },
    entries() { return [...byId.entries()]; },
    reconcile(ids, { create, update, remove }) { const wanted = new Set(ids); for (const [id, object] of byId) if (!wanted.has(id)) { remove(object, id); byId.delete(id); } for (const id of wanted) { const object=byId.get(id); if (object) update(object,id); else byId.set(id,create(id)); } },
  };
}
