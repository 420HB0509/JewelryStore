import { AlertTriangle } from "lucide-react";

/** Shown when the Vercel project isn't connected to storage yet. */
export default function SetupNotice({ storage }) {
  const needsDb = storage.catalog === "none";
  const needsBlob = storage.uploads === "none";
  if (!needsDb && !needsBlob) return null;

  return (
    <div className="setup">
      <AlertTriangle size={20} />
      <div>
        <p className="setup__title">Finish setup {needsDb ? "to save your changes" : "to upload photos"}</p>
        <ol>
          <li>
            Open your project on <strong>vercel.com</strong> and go to the <strong>Storage</strong> tab.
          </li>
          {needsDb && (
            <li>
              Click <strong>Create Database</strong> → choose <strong>Upstash for Redis</strong> (free plan) →
              connect it to this project.
            </li>
          )}
          {needsBlob && (
            <li>
              Click <strong>Create</strong> → choose <strong>Blob</strong> → connect it to this project (used for
              product photos).
            </li>
          )}
          <li>
            Go to <strong>Deployments</strong>, open the latest one and click <strong>Redeploy</strong>.
          </li>
        </ol>
        {needsDb && <p className="setup__note">Until then you can look around, but changes can't be saved.</p>}
      </div>
    </div>
  );
}
