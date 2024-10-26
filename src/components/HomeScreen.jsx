import { Lock, Password } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

function PhoneScreenIcon({ name, icon, onClick }) {
  return (
    <div className="w-fit h-fit p-4 flex flex-col justify-center items-center">
      <button
        className="bg-white rounded-md w-[25vw] h-[25vw]"
        onClick={onClick}
      >
        {icon}
      </button>
      <span>{name}</span>
    </div>
  );
}

function ColourSelect({ onChange }) {
  return (
    <select className="capitalize rounded-md px-4 min-w-[35vw] w-[35vw]" onChange={onChange} defaultValue={"black"}>
      <option className="capitalize">black</option>
      <option className="capitalize">red</option>
      <option className="capitalize">blue</option>
      <option className="capitalize">green</option>
    </select>
  );
}

function SymbolSelect({ onChange }) {
  return (
    <select className="capitalize rounded-md px-4 w-full h-full min-w-[35vw] w-[35vw]" onChange={onChange} defaultValue={"Heart"}>
      <option className="capitalize">Heart</option>
      <option className="capitalize">Star</option>
      <option className="capitalize">Lowercase Lambda</option>
      <option className="capitalize">Lowercase Omega</option>
      <option className="capitalize">Lowercase Sigma</option>
      <option className="capitalize">Uppercase Lambda</option>
      <option className="capitalize">Uppercase Omega</option>
      <option className="capitalize">Uppercase Sigma</option>
    </select>
  );
}

export default function HomeScreen({ setPassword, resetApp }) {
  const [settingPassword, setSettingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState([
    "black",
    "Heart",
    "black",
    "Heart",
  ]);
  
  return (
    <div className="w-full h-full">
      {/* Apps */}
      <div className="grid grid-cols-3">
        <PhoneScreenIcon
          name={"Set password"}
          onClick={() => {
            setSettingPassword(true);
          }}
          icon={<Password className="w-full h-full fill-black" />}
        />
        <PhoneScreenIcon
          name={"Lock phone"}
          onClick={() => {
            resetApp();
          }}
          icon={<Lock className="w-full h-full fill-black" />}
        />
      </div>

      {/* Setting password modal */}
      <div
        className={twMerge(
          `absolute top-0 left-0 backdrop-blur-md bg-[#00000080] w-screen h-screen transition-all duration-200 flex flex-col space-y-4 justify-start items-center p-4`,
          `${settingPassword ? `translate-y-[0vh]` : `translate-y-[100vh]`}`
        )}
      >
        <span className="text-lg font-black">Set new password</span>
        <div className="flex flex-col space-y-2 justify-center items-start">
          <div className="flex flex-row space-x-4 w-full">
            <span className="max-w-[15vw] w-full min-w-[15vw]">First colour</span>
            <ColourSelect
              onChange={(e) => {
                let updatedPassword = newPassword;
                updatedPassword[0] = e.target.value;
                setNewPassword(updatedPassword);
              }}
            />
          </div>
          <div className="flex flex-row space-x-4">
            <span className="max-w-[15vw] w-full min-w-[15vw]">First symbol</span>
            <SymbolSelect
              onChange={(e) => {
                let updatedPassword = newPassword;
                updatedPassword[1] = e.target.value;
                setNewPassword(updatedPassword);
              }}
            />
          </div>
          <div className="flex flex-row space-x-4">
            <span className="max-w-[15vw] w-full min-w-[15vw]">Second colour</span>
            <ColourSelect
              onChange={(e) => {
                let updatedPassword = newPassword;
                updatedPassword[2] = e.target.value;
                setNewPassword(updatedPassword);
              }}
            />
          </div>
          <div className="flex flex-row space-x-4">
            <span className="max-w-[15vw] w-full min-w-[15vw]">Second symbol</span>
            <SymbolSelect
              onChange={(e) => {
                let updatedPassword = newPassword;
                updatedPassword[3] = e.target.value;
                setNewPassword(updatedPassword);
              }}
            />
          </div>
        </div>
        <button
          className="bg-green-400 text-black font-black text-lg p-2 rounded-md border border-[#383838]"
          onClick={() => {
            setPassword(newPassword);
            setSettingPassword(false);
          }}
        >
          Set password?
        </button>
        <button
          className="bg-red-500 text-white font-black text-lg p-2 rounded-md border border-[#383838]"
          onClick={() => {
            setSettingPassword(false);
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
