import { useEffect, useState } from "react";
import { Inbox, Send, Archive, Trash2, Mail, Phone, User, Reply, Globe, Eye } from "lucide-react";
import PageTransition from "../../components/PageTransition"; // Ensure PageTransition is imported
import LoadingSkeleton from "../../components/LoadingSkeleton";
import { apiFetch } from "../../app/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useDialog } from "../../context/DialogContext";

function AdminInboxPage() {
  const { token } = useAuth();
  const { pushToast } = useToast();
  const { showConfirm } = useDialog();
  const [filter, setFilter] = useState("ALL");
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);

  const loadList = async () => {
    const suffix = filter === "ALL" ? "" : `?status=${filter.toLowerCase()}`;
    const response = await apiFetch(`/messages${suffix}`, { token });
    setMessages(response.data || []);
  };

  const loadDetails = async (id) => {
    const response = await apiFetch(`/messages/${id}`, { token });
    setSelected(response.data);
  };

  useEffect(() => {
    let mounted = true;
    loadList()
      .catch((error) => pushToast(error.message, "error"))
      .finally(() => { if (mounted) setLoading(false); });

    const interval = setInterval(() => {
      loadList().catch(() => undefined);
    }, 30000);

    return () => { mounted = false; clearInterval(interval); };
  }, [filter, token, pushToast]); // Added pushToast to dependencies

  const onReply = async () => {
    if (!selected?.id || !replyText.trim()) return;
    try {
      await apiFetch(`/messages/${selected.id}/reply`, { method: "POST", token, body: { replyText } });
      pushToast("Response delivered successfully.", "success");
      setReplyText("");
      await loadDetails(selected.id);
      await loadList();
    } catch (error) { pushToast(error.message, "error"); }
  };

  const onArchive = async () => {
    if (!selected?.id) return;
    showConfirm({
      title: "Archive Message",
      message: "Move this inquiry to the archive for historical records?",
      confirmText: "Archive",
      onConfirm: async () => {
        try {
          await apiFetch(`/messages/${selected.id}/archive`, { method: "POST", token });
          pushToast("Inquiry archived.", "success");
          setSelected(null);
          await loadList();
        } catch (error) { pushToast(error.message, "error"); }
      },
    });
  };

  const onDelete = async () => {
    if (!selected?.id) return;
    showConfirm({
      title: "Permanently Delete?",
      message: "This will remove the message from the system forever.",
      confirmText: "Delete",
      variant: "danger",
      onConfirm: async () => {
        try {
          await apiFetch(`/messages/${selected.id}`, { method: "DELETE", token });
          pushToast("Message purged.", "success");
          setSelected(null);
          await loadList();
        } catch (error) { pushToast(error.message, "error"); }
      },
    });
  };

  const onMarkAsRead = async (id) => {
    try {
      await apiFetch(`/messages/${id}/read`, { method: "POST", token });
      pushToast("Message marked as read.", "success");
      // Update the message status in the local state without reloading the entire list
      setMessages(prevMessages => prevMessages.map(msg =>
        msg.id === id ? { ...msg, status: 'READ' } : msg
      ));
      // If the selected message was marked as read, update its status too
      setSelected(prevSelected => prevSelected && prevSelected.id === id ? { ...prevSelected, status: 'READ' } : prevSelected);
      // Consider adding a mechanism to refresh the dashboard summary here if needed
    } catch (error) { pushToast(error.message, "error"); }
  };

  return (
    <PageTransition>
      <div className="flex flex-col gap-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-black text-accent-600 uppercase tracking-widest">Communications</span>
            <h2 className="text-2xl font-black text-brand-900 m-0 uppercase tracking-tight leading-tight">Inquiry Inbox</h2>
          </div>
          
          <div className="flex bg-white p-1 rounded-xl border border-border-subtle shadow-sm">
            {["ALL", "UNREAD", "READ", "ARCHIVED"].map((status) => (
              <button
                key={status}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all border-none cursor-pointer ${
                  filter === status ? "bg-brand-900 text-white shadow-md" : "text-text-400 hover:text-brand-900 bg-transparent"
                }`}
                onClick={() => { setFilter(status); setSelected(null); }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* List Panel */}
          <div className="lg:col-span-4 flex flex-col gap-4">
           <div className="bg-white rounded-3xl border border-border-subtle shadow-md overflow-y-auto max-h-[calc(100vh-250px)] custom-scrollbar">
              {loading ? (
                <div className="p-6 flex flex-col gap-4">
                  {Array(4).fill(0).map((_, i) => <LoadingSkeleton key={i} className="h-20 rounded-xl" />)}
                </div>
              ) : messages.length === 0 ? (
                <div className="p-20 text-center flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-surface-200 rounded-2xl flex items-center justify-center text-brand-400 border border-border-subtle">
                    <Inbox size={32} />
                  </div>
                  <h3 className="text-sm font-bold text-brand-900 uppercase">No Messages</h3>
                </div>
              ) : (
                <div className="flex flex-col">
                  {messages.map((msg) => (
                    (() => {
                      const status = String(msg.status || "").toUpperCase();
                      return (
                    <button
                      key={msg.id}
                      className={`p-6 text-left border-b border-border-subtle last:border-0 hover:bg-brand-50/50 transition-all group relative border-none cursor-pointer w-full bg-transparent ${
                        selected?.id === msg.id ? "bg-brand-50" : ""
                      }`}
                      onClick={() => loadDetails(msg.id)}
                    >
                      {status === 'UNREAD' && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-accent-600 rounded-full" />}
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-black text-text-400 uppercase tracking-tighter">#{msg.id}</span>
                        <span className="text-[10px] font-bold text-text-400">{new Date(msg.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h4 className={`text-sm font-black m-0 truncate ${status === 'UNREAD' ? 'text-brand-900' : 'text-text-700'}`}>
                        {msg.subject || "No subject"}
                      </h4>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-text-500 font-bold truncate m-0">{msg.senderName || msg.senderEmail || "Unknown sender"}</p>
                        {status === 'UNREAD' && (
                          <button onClick={(e) => { e.stopPropagation(); onMarkAsRead(msg.id); }}
                                  className="p-1 text-brand-600 hover:bg-brand-100 rounded-lg transition-colors bg-transparent border-none cursor-pointer"
                                  title="Mark as Read">
                            <Eye size={14} />
                          </button>
                        )}
                      </div>
                    </button>
                      );
                    })()
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl border border-border-subtle shadow-md min-h-[500px] flex flex-col overflow-hidden">
              {!selected ? (
                <div className="flex-grow flex flex-col items-center justify-center gap-4 text-text-400">
                  <Mail size={48} className="opacity-20" />
                  <p className="text-xs font-black uppercase tracking-widest m-0">Select a thread to view</p>
                </div>
              ) : (
                <div className="flex flex-col p-10 overflow-y-auto max-h-[calc(100vh-250px)] custom-scrollbar">
                  <div className="flex flex-col md:flex-row justify-between items-start border-b border-border-subtle pb-8 mb-8 gap-4">
                    <div className="flex flex-col gap-2 flex-grow">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-black px-2.5 py-1 rounded-full uppercase ${String(selected.status || "").toUpperCase() === 'UNREAD' ? 'bg-accent-600 text-white' : 'bg-surface-300 text-text-500'}`}>
                          {selected.status}
                        </span>
                        <span className="text-xs font-bold text-text-400 uppercase tracking-widest">{new Date(selected.createdAt).toLocaleString()}</span>
                      </div>
                      <h2 className="text-xl font-black text-brand-900 uppercase tracking-tight m-0">{selected.subject}</h2>
                      <div className="flex flex-wrap gap-6 mt-4">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-800"><User size={18}/></div>
                          <div className="flex flex-col leading-tight">
                            <span className="text-sm font-black text-text-900">{selected.fullName}</span>
                            <span className="text-xs font-bold text-text-400 lowercase">{selected.email}</span>
                          </div>
                        </div>
                        {selected.phone && (
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-surface-100 flex items-center justify-center text-text-700"><Phone size={18}/></div>
                            <span className="text-sm font-bold text-text-700">{selected.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={onArchive} className="p-3 bg-surface-100 text-brand-800 rounded-xl hover:bg-brand-100 transition-colors border-none cursor-pointer shadow-sm" title="Archive"><Archive size={20}/></button>
                      <button onClick={onDelete} className="p-3 bg-danger/10 text-danger rounded-xl hover:bg-danger/20 transition-colors border-none cursor-pointer shadow-sm" title="Delete"><Trash2 size={20}/></button>
                    </div>
                  </div>

                  <div className="flex-grow">
                    <p className="text-text-700 font-medium leading-relaxed whitespace-pre-wrap mb-10 text-sm m-0">
                      {selected.message}
                    </p>

                    <div className="flex flex-col gap-6">
                      <div className="flex items-center gap-3">
                        <Reply size={18} className="text-accent-600" />
                        <h3 className="text-sm font-black text-brand-800 uppercase tracking-widest m-0">Official Response</h3>
                      </div>
                      <textarea
                        className="w-full bg-surface-50 border border-border-subtle p-6 rounded-2xl focus:ring-2 focus:ring-brand-600 outline-none text-sm font-semibold min-h-[160px] leading-relaxed"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Compose your reply here..."
                      />
                      <div className="flex justify-end">
                        <button 
                          onClick={onReply} 
                          disabled={!replyText.trim()}
                          className="btn btn-primary px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg border-none cursor-pointer flex items-center gap-2"
                        >
                          <Send size={16}/> Send Reply
                        </button>
                      </div>

                      {selected.replies?.length > 0 && (
                        <div className="mt-12 flex flex-col gap-6">
                          <h3 className="text-xs font-black text-text-400 uppercase tracking-widest pb-4 border-b border-border-subtle m-0">Correspondence History</h3>
                          <div className="flex flex-col gap-4">
                            {selected.replies.map((reply) => (
                              <div key={reply.id} className="p-6 bg-surface-200 rounded-[24px] relative">
                                <p className="text-sm font-medium text-text-700 leading-relaxed m-0">{reply.replyText}</p>
                                <div className="mt-4 flex justify-between items-center">
                                  <span className="text-[10px] font-black text-brand-800 uppercase tracking-widest">{reply.adminName || "System Administrator"}</span>
                                  <span className="text-[9px] font-bold text-text-400 uppercase">{new Date(reply.sentAt).toLocaleString()}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </PageTransition>
  );
}

export default AdminInboxPage;
