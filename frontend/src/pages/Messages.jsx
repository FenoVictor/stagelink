import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MessageSquare, Send, ArrowLeft, User, Building2, Loader2, Plus, X, Search as SearchIcon, Phone, Mail, Paperclip, FileText } from "lucide-react";
import { conversationService } from "../services/conversationService";
import { notificationService } from "../services/notificationService";
import { userService } from "../services/userService";
import { getErrorMessage } from "../services/api";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
  if (diff < 172800) return "Hier";
  if (diff < 2592000) return `Il y a ${Math.floor(diff / 86400)} jours`;
  return date.toLocaleDateString("fr-FR");
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function getOtherParticipant(conversation, user) {
  if (!conversation || !user) return null;
  if (user.role === "student") {
    return conversation.company?.name || conversation.participant2?.name || "Entreprise";
  }
  if (user.role === "company") {
    return conversation.student?.name || conversation.participant1?.name || "Étudiant";
  }
  return "Utilisateur";
}

export default function Messages() {
  const { id: routeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const basePath = user?.role === "company" ? "/company" : "/student";

  const [conversations, setConversations] = useState([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [conversationsError, setConversationsError] = useState(null);
  const [search, setSearch] = useState("");

  const [selectedId, setSelectedId] = useState(routeId || null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [showNewConv, setShowNewConv] = useState(false);
  const [userQuery, setUserQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    conversationService.getAll()
      .then((data) => setConversations(Array.isArray(data) ? data : []))
      .catch((err) => setConversationsError(getErrorMessage(err)))
      .finally(() => setConversationsLoading(false));
  }, []);

  const selectedConversation = conversations.find((c) => c.id === Number(selectedId)) || null;

  const fetchMessages = useCallback(async () => {
    if (!selectedId) return;
    setMessagesLoading(true);
    try {
      const data = await conversationService.getMessages(selectedId);
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setMessagesLoading(false);
    }
  }, [selectedId]);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationService.getAll();
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    if (selectedId) {
      fetchMessages();
      fetchNotifications();
      const interval = setInterval(fetchMessages, 30000);
      return () => clearInterval(interval);
    } else {
      setMessages([]);
    }
  }, [selectedId, fetchMessages, fetchNotifications]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (selectedId && notifications.length > 0) {
      const prefix = "message:" + selectedId;
      const related = notifications.filter((n) => n.type === prefix);
      related.forEach((n) => {
        notificationService.markAsRead(n.id).catch(() => {});
      });
    }
  }, [selectedId, notifications]);

  useEffect(() => {
    if (routeId && routeId !== selectedId) {
      setSelectedId(routeId);
    }
  }, [routeId, selectedId]);

  useEffect(() => {
    if (!showNewConv || userQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await userService.search(userQuery.trim());
        setSearchResults(Array.isArray(results) ? results : []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [userQuery, showNewConv]);

  const startNewConversation = async (recipient) => {
    try {
      const text = `Bonjour ${recipient.name}, je souhaite échanger avec vous.`;
      const res = await conversationService.start({
        recipient_id: recipient.id,
        message: text,
      });
      const convId = res.conversation?.id || res.id;
      setShowNewConv(false);
      setUserQuery("");
      setSearchResults([]);
      if (convId) {
        setSelectedId(String(convId));
        navigate(`${basePath}/messages/${convId}`, { replace: true });
        // Refresh conversation list
        conversationService.getAll()
          .then((data) => setConversations(Array.isArray(data) ? data : []))
          .catch(() => {});
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const selectConversation = (convId) => {
    setSelectedId(convId);
    navigate(`${basePath}/messages/${convId}`, { replace: true });
  };

  const goBackToList = () => {
    setSelectedId(null);
    navigate(`${basePath}/messages`, { replace: true });
  };

  const handleSend = async () => {
    const text = inputValue.trim();
    if ((!text && !selectedFile) || !selectedId || sending) return;
    setSending(true);
    setInputValue("");
    setSelectedFile(null);
    try {
      const formData = new FormData();
      if (text) formData.append("message", text);
      if (selectedFile) formData.append("file", selectedFile);
      const sent = await conversationService.sendMessageWithFile(selectedId, formData);
      setMessages((prev) => [...prev, sent]);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === Number(selectedId)
            ? { ...c, last_message: { message: text || "Pièce jointe", created_at: new Date().toISOString() } }
            : c
        )
      );
    } catch (err) {
      toast.error(getErrorMessage(err));
      if (text) setInputValue(text);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const name = getOtherParticipant(conv, user)?.toLowerCase() || "";
    const lastMsg = conv.last_message?.message?.toLowerCase() || "";
    return name.includes(q) || lastMsg.includes(q);
  });

  const unreadCount = (conv) => {
    return conv.unread_count || conv.unreadCount || 0;
  };

  const userRoleIcon = user?.role === "company" ? Building2 : User;

  if (conversationsLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (conversationsError) {
    return (
      <div className="text-center py-12 text-danger">
        <p>{conversationsError}</p>
        <button
          onClick={() => {
            setConversationsLoading(true);
            setConversationsError(null);
            conversationService.getAll()
              .then((data) => setConversations(Array.isArray(data) ? data : []))
              .catch((err) => setConversationsError(getErrorMessage(err)))
              .finally(() => setConversationsLoading(false));
          }}
          className="mt-4 text-primary underline cursor-pointer"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] bg-surface rounded-xl border border-border overflow-hidden">
      <div className={`w-full md:w-80 lg:w-96 border-r border-border flex flex-col bg-white ${selectedId ? "hidden md:flex" : "flex"}`}>
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">Messages</h2>
            <button
              onClick={() => { setShowNewConv(!showNewConv); setUserQuery(""); setSearchResults([]); }}
              className="p-1.5 rounded-lg hover:bg-primary-bg text-primary transition-colors cursor-pointer"
              title="Nouvelle conversation"
            >
              <Plus size={20} />
            </button>
          </div>
          {showNewConv ? (
            <div className="space-y-2">
              <div className="relative">
                <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Nom, email ou téléphone..."
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-sm bg-gray-100 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  autoFocus
                />
                {userQuery && (
                  <button
                    onClick={() => { setUserQuery(""); setSearchResults([]); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-text-muted hover:text-text"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              {searching && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 size={18} className="animate-spin text-primary" />
                </div>
              )}
              {!searching && searchResults.length > 0 && (
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {searchResults.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => startNewConversation(u)}
                      className="w-full text-left flex items-center gap-3 p-2.5 rounded-lg hover:bg-primary-bg transition-colors cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary-bg flex items-center justify-center shrink-0">
                        {u.role === "company" ? <Building2 size={14} className="text-primary" /> : <User size={14} className="text-primary" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{u.name}</p>
                        <div className="flex items-center gap-2 text-xs text-text-muted">
                          {u.email && <span className="flex items-center gap-1 truncate"><Mail size={10} />{u.email}</span>}
                          {u.phone && <span className="flex items-center gap-1"><Phone size={10} />{u.phone}</span>}
                        </div>
                      </div>
                      <span className="text-[10px] uppercase font-medium text-text-muted shrink-0">{u.role === "company" ? "Entreprise" : "Étudiant"}</span>
                    </button>
                  ))}
                </div>
              )}
              {!searching && userQuery.length >= 2 && searchResults.length === 0 && (
                <p className="text-xs text-text-muted text-center py-2">Aucun utilisateur trouvé</p>
              )}
            </div>
          ) : (
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher une conversation..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-gray-100 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-text-muted p-6 text-center">
              <MessageSquare size={40} className="mb-3 opacity-40" />
              <p className="text-sm">{search ? "Aucun résultat" : "Aucune conversation"}</p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const name = getOtherParticipant(conv, user);
              const lastMsg = conv.last_message?.message || "";
              const lastTime = conv.last_message?.created_at || conv.created_at;
              const isActive = Number(selectedId) === conv.id;
              const unread = unreadCount(conv);

              return (
                <button
                  key={conv.id}
                  onClick={() => selectConversation(conv.id)}
                  className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-border/50 cursor-pointer ${
                    isActive ? "bg-primary-bg" : ""
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-primary-bg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User size={18} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-sm truncate">{name}</span>
                      <span className="text-xs text-text-muted whitespace-nowrap">
                        {lastTime ? timeAgo(lastTime) : ""}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className="text-xs text-text-muted truncate">{lastMsg}</p>
                      {unread > 0 && (
                        <span className="flex-shrink-0 bg-primary text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1">
                          {unread > 99 ? "99+" : unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className={`flex-1 flex flex-col bg-white ${!selectedId ? "hidden md:flex" : "flex"}`}>
        {!selectedId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-text-muted p-8">
            <div className="w-16 h-16 rounded-full bg-primary-bg flex items-center justify-center mb-4">
              <MessageSquare size={32} className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-text mb-1">Sélectionnez une conversation</h3>
            <p className="text-sm">Choisissez une conversation dans la liste pour commencer à discuter</p>
          </div>
        ) : (
          <>
            <div className="px-4 py-3 border-b border-border flex items-center gap-3 bg-white">
              <button
                onClick={goBackToList}
                className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="w-9 h-9 rounded-full bg-primary-bg flex items-center justify-center flex-shrink-0">
                <User size={18} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">
                  {getOtherParticipant(selectedConversation, user)}
                </h3>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messagesLoading && messages.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 size={24} className="animate-spin text-primary" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-text-muted">
                  <MessageSquare size={36} className="mb-2 opacity-40" />
                  <p className="text-sm">Aucun message. Envoyez le premier message !</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMine = msg.sender_id === user?.id;
                  const showSender = idx === 0 || messages[idx - 1]?.sender_id !== msg.sender_id;
                  const msgTime = msg.created_at;

                  return (
                    <div key={msg.id || idx} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] ${isMine ? "order-1" : "order-1"}`}>
                        {!isMine && showSender && (
                          <p className="text-[11px] text-text-muted mb-1 ml-1">
                            {msg.sender?.name || "Utilisateur"}
                          </p>
                        )}
                        <div
                          className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed break-words ${
                            isMine
                              ? "bg-primary text-white rounded-br-md"
                              : "bg-white text-text border border-border rounded-bl-md shadow-sm"
                          }`}
                        >
                          {msg.message && <p>{msg.message}</p>}
                          {msg.file_path && (
                            <a
                              href={`${(import.meta.env.VITE_API_URL || "http://localhost:8000/api").replace(/\/api$/, "")}/storage/${msg.file_path}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium ${
                                isMine
                                  ? "bg-white/20 text-white hover:bg-white/30"
                                  : "bg-gray-100 text-text-muted hover:bg-gray-200"
                              } transition-colors no-underline`}
                            >
                              <FileText size={14} />
                              <span className="truncate max-w-[120px]">{msg.file_name || "Fichier"}</span>
                              {msg.file_size && (
                                <span className="opacity-70">({(msg.file_size / 1024).toFixed(0)} Ko)</span>
                              )}
                            </a>
                          )}
                        </div>
                        <p className={`text-[10px] text-text-muted mt-0.5 ${isMine ? "text-right mr-1" : "ml-1"}`}>
                          {msgTime ? formatTime(msgTime) : ""}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="px-4 py-3 border-t border-border bg-white">
              {selectedFile && (
                <div className="flex items-center gap-2 mb-2 px-2 py-1.5 bg-gray-100 rounded-lg text-sm">
                  <FileText size={14} className="text-text-muted" />
                  <span className="flex-1 truncate text-text-muted">{selectedFile.name}</span>
                  <button
                    onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    className="cursor-pointer text-text-muted hover:text-text"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-9 h-9 rounded-full bg-gray-100 text-text-muted flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer flex-shrink-0"
                  title="Joindre un fichier"
                >
                  <Paperclip size={16} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                  className="hidden"
                />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Écrivez un message..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={sending}
                  className="flex-1 px-4 py-2.5 text-sm bg-gray-100 border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-colors disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={(!inputValue.trim() && !selectedFile) || sending}
                  className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex-shrink-0"
                >
                  {sending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
