"use client";

import { useState } from "react";

export default function CheckoutForm({ items, onClearCart }: { items: any[], onClearCart: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          customer: formData,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Tack för ditt köp! Ordernummer: " + data.orderId);
        onClearCart(); // Töm localStorage
        window.location.href = "/"; // Skicka hem kunden
      }
    } catch (error) {
      alert("Något gick fel vid betalningen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-10 p-6 bg-gray-50 rounded-xl space-y-4">
      <h2 className="text-xl font-bold">Delivery details</h2>
      <input
        required
        placeholder="Fullständigt namn"
        className="w-full p-2 border rounded"
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <input
        required
        type="email"
        placeholder="E-post"
        className="w-full p-2 border rounded"
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <textarea
        required
        placeholder="Adress, Postnummer, Ort"
        className="w-full p-2 border rounded"
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "Processing..." : "Pay and complete purchase"}
      </button>
    </form>
  );
}