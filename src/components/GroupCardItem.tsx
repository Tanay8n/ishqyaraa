"use client";

import React, { useState } from "react";
import { Users, Clock, MapPin, Sparkles, Check, ChevronRight, X } from "lucide-react";
import type { GroupCard } from "@/lib/data";

export function GroupCardItem({ group }: { group: GroupCard }) {
  const [joined, setJoined] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const isFull = group.membersCount >= group.maxMembers;

  return (
    <>
      <div className="bg-white rounded-3xl border border-[#e7dfd5] p-5 sm:p-6 transition-all hover:shadow-lg hover:border-[#f4c7c9] flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          {/* Header Row: Date & Member Count */}
          <div className="flex items-center justify-between gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#fef3c7] text-[#92400e] border border-[#fde68a]">
              {group.date} • {group.time}
            </span>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700">
              <Users className="w-3.5 h-3.5 text-[#9e1b22]" />
              <span>
                {joined ? group.membersCount + 1 : group.membersCount} / {group.maxMembers} members
              </span>
            </div>
          </div>

          {/* Title & Theme */}
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-stone-900 group-hover:text-[#9e1b22] transition-colors">
              {group.title}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-1">
              <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate">{group.location}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-stone-600 text-sm line-clamp-2 leading-relaxed">
            {group.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {group.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-[#faf7f2] text-stone-600 border border-[#e7dfd5]"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Organizer Avatar & Name */}
          <div className="flex items-center gap-2.5 pt-2 border-t border-stone-100 text-xs text-stone-600">
            <img
              src={group.organizer.avatar}
              alt={group.organizer.name}
              className="w-6 h-6 rounded-full object-cover ring-1 ring-[#9e1b22]/30"
            />
            <span>
              Organized by <strong className="text-stone-800">{group.organizer.name}</strong> ({group.organizer.college})
            </span>
          </div>
        </div>

        {/* Action Button: View Group */}
        <div className="pt-2 flex items-center gap-2">
          <button
            onClick={() => setModalOpen(true)}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 hover:text-stone-900 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>View Group Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setJoined(!joined)}
            disabled={isFull && !joined}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              joined
                ? "bg-emerald-600 text-white"
                : isFull
                ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                : "bg-gradient-to-r from-[#9e1b22] to-[#c22830] text-white hover:shadow-md hover:shadow-[#9e1b22]/20"
            }`}
          >
            {joined ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Joined</span>
              </>
            ) : isFull ? (
              <span>Full</span>
            ) : (
              <span>Join</span>
            )}
          </button>
        </div>
      </div>

      {/* Group Details Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 border border-stone-200 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#fef3c7] text-[#92400e]">
                {group.date} • {group.time}
              </span>
              <h2 className="text-2xl font-bold text-stone-900 mt-2">
                {group.title}
              </h2>
              <p className="text-xs text-stone-500 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                {group.location}
              </p>
            </div>

            <p className="text-stone-700 text-sm leading-relaxed">
              {group.description}
            </p>

            {/* Planned Route Stops */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Pandal Route Stops
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {group.routeHighlights.map((stop, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-[#faf7f2] border border-[#e7dfd5] text-xs font-medium text-stone-800 flex items-center gap-2"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#9e1b22] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <span className="truncate">{stop}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Organizer card */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center gap-3">
              <img
                src={group.organizer.avatar}
                alt={group.organizer.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-[#9e1b22]/20"
              />
              <div className="text-xs">
                <p className="font-bold text-stone-900">{group.organizer.name}</p>
                <p className="text-stone-500">{group.organizer.college}</p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setJoined(!joined);
                  setModalOpen(false);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-white ${
                  joined
                    ? "bg-stone-700"
                    : "bg-gradient-to-r from-[#9e1b22] to-[#c22830]"
                }`}
              >
                {joined ? "Leave Group" : "Confirm & Join Squad 🪷"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
