'use client';

import { Html5Qrcode } from "html5-qrcode";

import { useEffect, useState } from "react";

import { useReadContract } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";

import abi from "./constants/abi.json";
const contractAddress = "0x354ef633Fb3ba2c427F18fC39Fcf96A31d0fD577";

export default function Page() {
  const [scannedAddress, setScannedAddress] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [scanning, setScanning] = useState(false);

  const queryClient = useQueryClient();

  const {
    data: balanceData,
    isError: balanceIsError,
    isPending: balanceIsPending,
    queryKey: balanceQueryKey,
  } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi,
    functionName: "balanceOf",
    args: [scannedAddress],
  });

  useEffect(() => {
    if (balanceData) {
      const balance = balanceData as bigint
      console.log("Balance: ", balance);
      setAuthorized(balance > 0n);
    }
  }, [balanceData]);

  useEffect(() => {
    console.log("Refreshing balance");
    queryClient.invalidateQueries({ queryKey: balanceQueryKey });
  }, [scannedAddress]);

  
  async function startScanning() {
    setScanning(true);
    setScannedAddress(null);
    setAuthorized(false);
    let cameraId = "";

    try {
      // This method will trigger user permissions
      const devices = await Html5Qrcode.getCameras();

      if (!devices || devices.length === 0) {
        return;
      }

      cameraId = devices[0].id;

      const html5QrCode = new Html5Qrcode("reader", false);

      try {
        html5QrCode.start(
          { facingMode: "environment" } || cameraId,
          {
            fps: 10, // Optional, frame per seconds for qr code scanning
            qrbox: { width: 500, height: 500 }, // Optional, if you want bounded box UI
          },
          (decodedText) => {
            let scannedAddress = decodedText;
            if (scannedAddress.includes("ethereum:")) {
              scannedAddress = scannedAddress.replace("ethereum:", "");
            }

            // If there is an @ symbol, remove it and everything after it
            if (scannedAddress.includes("@")) {
              scannedAddress = scannedAddress.split("@")[0];
            }

            // If it's not the correct length, it's not a valid address
            if (scannedAddress.length !== 42) {
              return;
            }

            // handle the result
            setScannedAddress(scannedAddress);
            setScanning(false);
            html5QrCode.stop();
          },
          (errorMessage) => {
            // parse error, ignore it.
          }
        );
      } catch (error) {}
    } catch (error) {}
  }

  return (
    <div className="flex flex-col w-96 md:w-[600px]">
      <section className="flex flex-col w-full mb-6 pb-6 border-b border-sky-800">
        <aside className="flex mb-6">
          <h2 className="text-2xl">Welcome to our Event!</h2>
        </aside>
        <main className="flex flex-col space-x-4">
          <p className="text-body text-white mb-4">
            Please scan the QR code for your wallet address that holds the NFT.
          </p>
          <div id="middle" className="h-3/4 flex justify-center items-center">
            {!scanning && (
              <button
                onClick={() => startScanning()}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Scan QR Code
              </button>
            )}
            {scanning && (
              <div id="reader-container" className="w-full h-full">
                <div id="reader"></div>
              </div>
            )}
          </div>
          <div id="bottom" className="h-1/8">
            <br />
            <p>Last scanned: {scannedAddress}</p>
            <p>Authorized: {authorized ? "Yes" : "No"}</p>
          </div>
        </main>
      </section>
    </div>
  );
}
