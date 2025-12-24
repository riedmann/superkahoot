import React from "react";

interface ParticipantNameProps {
  name: string;
}

export const ParticipantName: React.FC<ParticipantNameProps> = ({ name }) => (
  <li className="text-lg shadow-md bg-white rounded px-3 py-2 mb-2">{name}</li>
);
