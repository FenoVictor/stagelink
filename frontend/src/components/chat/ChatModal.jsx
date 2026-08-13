import { useState, useEffect, useRef } from "react";
import { Send, X } from "lucide-react";
import { conversationService } from "../../services/conversationService";
import { getErrorMessage } from "../../services/api";
import { getConversationChannel, isWebSocketEnabled } from "../../services/broadcast";
import Modal from "../ui/Modal";
import toast from "react-hot-toast";

export default function ChatModal({ open, onClose, internship, companyId, companyName }) {
  const [convId, setConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const echoChannelRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setConvId(null);
      setMessages([]);
      return;
    }

    setLoading(true);
    const recipientId = companyId || internship?.company?.user_id;
    conversationService.start({ internship_id: internship?.id, recipient_id: recipientId, message: "Bonjour, je suis intéressé(e) par cette offre." })
      .then((res) => {
        const conv = res.conversation || res;
        setConvId(conv.id);
        const firstMsg = res.message;
        return conversationService.getMessages(conv.id).then((page) => {
          let msgs = page?.data || (Array.isArray(page) ? page : []);
          if (firstMsg && !msgs.find((m) => m.id === firstMsg.id)) {
            msgs = [...msgs, firstMsg];
          }
          setMessages(msgs);
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, internship?.id]);

  useEffect(() => {
    if (!convId) return;

    const channel = getConversationChannel(convId);
    if (channel) {
      echoChannelRef.current = channel;

      channel.listen(".message.new", (data) => {
        setMessages((prev) => {
          if (prev.find((m) => m.id === data.id)) return prev;
          return [...prev, data];
        });
      });
    }

    let pollId = null;
    if (!isWebSocketEnabled()) {
      pollId = setInterval(() => {
        conversationService.getMessages(convId).then((page) => {
          const msgs = page?.data || (Array.isArray(page) ? page : []);
          setMessages((prev) => {
            if (msgs.length === prev.length) return prev;
            return msgs;
          });
        }).catch(() => {});
      }, 8000);
    }

    return () => {
      if (pollId) clearInterval(pollId);
      if (echoChannelRef.current) {
        echoChannelRef.current.stopListening(".message.new");
        echoChannelRef.current = null;
      }
    };
  }, [convId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending || !convId) return;
    setSending(true);
    try {
      const sent = await conversationService.sendMessage(convId, input.trim());
      setMessages((prev) => {
        if (prev.find((m) => m.id === sent.id)) return prev;
        return [...prev, sent];
      });
      setInput("");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`${companyName || "Entreprise"}`} size="md">
      <div className="flex flex-col h-[28rem]">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-3 p-1">
              {messages.length === 0 && (
                <p className="text-sm text-text-muted text-center py-8">Aucun message. Écrivez votre premier message.</p>
              )}
              {messages.map((msg, i) => {
                const isMine = msg.user_id === msg.sender_id || msg.sender_id === undefined;
                return (
                  <div key={msg.id || i} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                      isMine ? "bg-primary text-white rounded-br-sm" : "bg-gray-100 text-text rounded-bl-sm"
                    }`}>
                      <p>{msg.message || msg.body}</p>
                      <p className={`text-[10px] mt-0.5 ${isMine ? "text-white/60" : "text-text-muted"}`}>
                        {msg.created_at ? new Date(msg.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : ""}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
            <div className="flex items-center gap-2 pt-3 border-t border-border mt-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Écrire un message..."
                className="flex-1 px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button onClick={handleSend} disabled={sending || !input.trim()} className="p-2 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-50 cursor-pointer">
                <Send size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
