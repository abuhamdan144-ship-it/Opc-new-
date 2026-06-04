// ============================================================
//  FIREBASE INTEGRATION — Oman Pakhtoon Community (OPC)
//  Ready to use — config already filled in
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ── YOUR FIREBASE CONFIG (already filled) ──────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyAWmYNZbjpijp6NGO-Lw743ko",
  authDomain:        "opc-new-48a8d.firebaseapp.com",
  projectId:         "opc-new-48a8d",
  storageBucket:     "opc-new-48a8d.firebasestorage.app",
  messagingSenderId: "211508737297",
  appId:             "1:211508737297:web:4762271661b0",
  measurementId:     "G-650K8N52S7"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// ── 1. MEMBER REGISTRATION ──────────────────────────────────
export async function registerMember(member) {
  try {
    const docRef = await addDoc(collection(db, "members"), {
      fullName:       member.fullName       || "",
      fatherName:     member.fatherName     || "",
      email:          member.email          || "",
      phone:          member.phone          || "",
      whatsapp:       member.whatsapp       || "",
      tribe:          member.tribe          || "",
      city:           member.city           || "",
      occupation:     member.occupation     || "",
      company:        member.company        || "",
      membershipType: member.membershipType || "regular",
      status:         "pending",
      membershipId:   "OPC-" + Date.now(),
      registeredAt:   serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ── 2. DONATIONS ────────────────────────────────────────────
export async function saveDonation(donation) {
  try {
    const receiptId = "DON-" + Date.now();
    const docRef = await addDoc(collection(db, "donations"), {
      donorName:     donation.donorName     || "Anonymous",
      donorPhone:    donation.donorPhone    || "",
      donorEmail:    donation.donorEmail    || "",
      amount:        parseFloat(donation.amount) || 0,
      currency:      "OMR",
      purpose:       donation.purpose       || "general",
      paymentMethod: donation.paymentMethod || "cash",
      message:       donation.message       || "",
      receiptId,
      status:        "received",
      donatedAt:     serverTimestamp()
    });
    return { success: true, id: docRef.id, receiptId };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ── 3. WELFARE / ASSISTANCE REQUEST ────────────────────────
export async function submitWelfareRequest(request) {
  try {
    const docRef = await addDoc(collection(db, "welfare_cases"), {
      applicantName: request.applicantName || "",
      phone:         request.phone         || "",
      whatsapp:      request.whatsapp      || "",
      issue:         request.issue         || "",
      description:   request.description   || "",
      urgency:       request.urgency       || "normal",
      employerName:  request.employerName  || "",
      city:          request.city          || "",
      status:        "open",
      caseId:        "WEL-" + Date.now(),
      submittedAt:   serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ── 4. CONTACT FORM ─────────────────────────────────────────
export async function saveContactMessage(contact) {
  try {
    const docRef = await addDoc(collection(db, "contacts"), {
      name:    contact.name    || "",
      email:   contact.email   || "",
      phone:   contact.phone   || "",
      subject: contact.subject || "",
      message: contact.message || "",
      status:  "unread",
      sentAt:  serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ── 5. EVENT REGISTRATION ───────────────────────────────────
export async function registerForEvent(registration) {
  try {
    const docRef = await addDoc(collection(db, "event_registrations"), {
      eventId:    registration.eventId    || "",
      eventTitle: registration.eventTitle || "",
      memberName: registration.memberName || "",
      phone:      registration.phone      || "",
      email:      registration.email      || "",
      guests:     parseInt(registration.guests) || 0,
      registeredAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ── 6. READ DATA (Admin) ────────────────────────────────────
export async function getAllMembers() {
  const q = query(collection(db, "members"), orderBy("registeredAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getAllDonations() {
  const q = query(collection(db, "donations"), orderBy("donatedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getOpenWelfareCases() {
  const q = query(collection(db, "welfare_cases"), where("status","==","open"), orderBy("submittedAt","desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateMemberStatus(memberId, status) {
  await updateDoc(doc(db, "members", memberId), { status });
}
