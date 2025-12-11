import { useEffect, useState } from "react";
import { FaFileUpload, FaCloudUploadAlt, FaInfoCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { createTest, getTestTypes } from "../../service/api2";
import { toast } from "react-toastify";
import ModalConfirm from "../../components/AirlinePartnerComponent/ModalConfirm";

const durationOptions = [
  { value: 0, label: "Select duration" },
  { value: 60, label: "60 minutes" },
  { value: 90, label: "90 minutes" },
  { value: 120, label: "120 minutes" },
];

const CreateTestPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    testName: "",
    purpose: "",
    testType: "0",
    maxScore: 0,
    durationInMinutes: "0",
    audioFile: null,
  });
  const [previewFile, setPreviewFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [testTypeOptions, setTestTypeOptions] = useState([
    { value: "0", label: "Select test type" },
  ]);
  const [isLoadingTestTypes, setIsLoadingTestTypes] = useState(false);

  // Fetch test types from API
  useEffect(() => {
    const fetchTestTypes = async () => {
      setIsLoadingTestTypes(true);
      try {
        const res = await getTestTypes();
        if (res.success && Array.isArray(res.data)) {
          const mapped = res.data
            .map((item) => {
              const value =
                item?.id ??
                item?.testTypeId ??
                item?.testType ??
                item?.code ??
                item?.value;
              if (value === undefined || value === null) return null;
              const label =
                item?.name ||
                item?.typeName ||
                item?.testTypeName ||
                item?.description ||
                item?.label ||
                `Type ${value}`;
              return { value: value.toString(), label };
            })
            .filter(Boolean);

          setTestTypeOptions([
            { value: "0", label: "Select test type" },
            ...mapped,
          ]);
        } else {
          setErrorMessage(res.error || "Unable to load test types");
        }
      } catch (err) {
        setErrorMessage(err.message || "Unable to load test types");
      } finally {
        setIsLoadingTestTypes(false);
      }
    };

    fetchTestTypes();
  }, []);

  const handleChange = (field) => (event) => {
    const value =
      field === "audioFile"
        ? event.target.files?.[0] ?? null
        : event.target.value;

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "audioFile") {
      const file = event.target.files?.[0];
      setPreviewFile(
        file
          ? {
            name: file.name,
            size: (file.size / (1024 * 1024)).toFixed(2),
            type: file.type || "Unknown type",
          }
          : null
      );
    }
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelModal(false);
    navigate("/examiner/testing");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      // Validate testName
      if (!formData.testName || !formData.testName.trim()) {
        setErrorMessage("Test name is required");
        setIsSubmitting(false);
        return;
      }

      // Validate purpose
      if (!formData.purpose || !formData.purpose.trim()) {
        setErrorMessage("Purpose is required");
        setIsSubmitting(false);
        return;
      }

      const testType = parseInt(formData.testType);
      const durationInMinutes = parseInt(formData.durationInMinutes);
      //const maxScore = parseInt(formData.maxScore);

      // Validate TestType
      if (!testType || testType === 0) {
        setErrorMessage("Please select test type");
        setIsSubmitting(false);
        return;
      }

      // Validate DurationInMinutes
      if (
        !durationInMinutes ||
        durationInMinutes === 0 ||
        ![60, 90, 120].includes(durationInMinutes)
      ) {
        setErrorMessage("Please select duration: 60, 90 or 120 minutes");
        setIsSubmitting(false);
        return;
      }

      // Validate MaxScore
      if (!formData.maxScore || !formData.maxScore > 0) {
        setErrorMessage("Max score must be greater than 0");
        setIsSubmitting(false);
        return;
      }

      // Validate AudioFile for EnglishListening (TestType = 1)
      if (testType === 1 && !formData.audioFile) {
        setErrorMessage(
          "Audio file is required for English Listening test type"
        );
        setIsSubmitting(false);
        return;
      }

      // Validate audio file format and size
      if (formData.audioFile) {
        const file = formData.audioFile;
        const fileExtension = file.name.split(".").pop().toLowerCase();

        if (fileExtension !== "mp3" && fileExtension !== "wav") {
          setErrorMessage("Audio file must be .mp3 or .wav");
          setIsSubmitting(false);
          return;
        }

        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > 50) {
          setErrorMessage("Audio file size must not exceed 50 MB");
          setIsSubmitting(false);
          return;
        }
      }

      // Prepare data to call API
      const testData = {
        TestName: formData.testName,
        Purpose: formData.purpose,
        TestType: testType,
        MaxScore: formData.maxScore,
        DurationInMinutes: durationInMinutes,
      };

      // Call API createTest
      const result = await createTest(testData, formData.audioFile);
      console.log("Creating test:", testData);

      if (result.success) {
        toast.success("Test created successfully!");
        navigate("/examiner/testing");
      } else {
        toast.error("Creating test failed. Please try again.");
      }
    } catch (error) {
      console.error("Error creating test:", error);
      setErrorMessage("An error occurred while creating the test. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-900">Create test</h1>
          <p className="max-w-3xl text-slate-600">
            Enter test information and upload an audio file that meets the requirements.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/examiner/testing")}
          className="inline-flex items-center self-start gap-2 px-4 py-2 text-sm font-medium transition border rounded-lg border-slate-300 text-slate-700 hover:bg-slate-100"
        >
          Back
        </button>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-6">
          <div className="p-6 bg-white border shadow-sm rounded-2xl border-slate-200">
            <div className="flex items-start gap-3">
              <span className="p-2 mt-1 text-indigo-600 rounded-full bg-indigo-50">
                <FaInfoCircle className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Audio upload requirements
                </h2>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  <li>• Allowed formats: .mp3 or .wav</li>
                  <li>• Max size: 50 MB</li>
                </ul>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="p-6 space-y-4 bg-white border shadow-sm rounded-2xl border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">
                Quick notes
              </h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li>
                  <span className="font-medium text-slate-800">
                    English Listening Test
                  </span>{" "}
                  requires an audio file; the system will validate on submit.
                </li>
                <li>
                  <span className="font-medium text-slate-800">
                    English Speaking Test and Practical Test
                  </span>{" "}
                  can skip audio if not needed.
                </li>
                <li>
                  Recommended filename format:{" "}
                  <span className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">
                    testcode_level.mp3
                  </span>
                  .
                </li>
                <li>
                  After creating the test, manage questions in the test detail page.
                </li>
              </ul>
            </div>

            <div className="p-6 space-y-3 text-sm text-indigo-700 border border-indigo-100 rounded-2xl bg-indigo-50">
              <h4 className="text-base font-semibold text-indigo-800">
                Security hints
              </h4>
              <p>
                Do not share join code publicly. Send to candidates via internal channels or system email.
              </p>
              <p>
                If you need to update audio, edit the test and upload a new file instead of deleting the test.
              </p>
            </div>
          </aside>

          <form
            onSubmit={handleSubmit}
            className="p-6 space-y-6 bg-white border shadow-sm rounded-2xl border-slate-200"
          >
            {errorMessage && (
              <div className="p-4 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
                <p>{errorMessage}</p>
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="testName"
                  className="text-sm font-medium text-slate-700"
                >
                  Test name
                </label>
                <input
                  id="testName"
                  type="text"
                  placeholder="Enter test name..."
                  value={formData.testName}
                  onChange={handleChange("testName")}
                  className="w-full px-3 py-2 text-sm border rounded-lg shadow-sm border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
                <span className="text-xs text-slate-500">
                  Displayed name, e.g. "English Level Test".
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="purpose"
                  className="text-sm font-medium text-slate-700"
                >
                  Purpose
                </label>
                <input
                  id="purpose"
                  type="text"
                  placeholder="Purpose..."
                  value={formData.purpose}
                  onChange={handleChange("purpose")}
                  className="w-full px-3 py-2 text-sm border rounded-lg shadow-sm border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
                <span className="text-xs text-slate-500">
                  Short note to describe the test purpose.
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="testType"
                  className="text-sm font-medium text-slate-700"
                >
                  Test type
                </label>
                <select
                  id="testType"
                  value={formData.testType}
                  onChange={handleChange("testType")}
                  className="w-full px-3 py-2 text-sm border rounded-lg shadow-sm border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  {testTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-slate-500">
                  Choose the test type to apply the matching audio requirement.
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="maxScore"
                  className="text-sm font-medium text-slate-700"
                >
                  Max score
                </label>
                <input
                  id="maxScore"
                  type="number"
                  value={formData.maxScore}
                  onChange={handleChange("maxScore")}
                  className="w-full px-3 py-2 text-sm border rounded-lg shadow-sm border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
                <span className="text-xs text-slate-500">
                  Maximum score for the test (e.g. 100).
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="durationInMinutes"
                  className="text-sm font-medium text-slate-700"
                >
                  Duration
                </label>
                <select
                  id="durationInMinutes"
                  value={formData.durationInMinutes}
                  onChange={handleChange("durationInMinutes")}
                  className="w-full px-3 py-2 text-sm border rounded-lg shadow-sm border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  {durationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-slate-500">
                  Select duration: 60, 90 or 120 minutes.
                </span>
              </div>
            </div>

            {formData.testType !== "2" && formData.testType !== "3" && (
              <div className="flex flex-col gap-3">
                <label className="text-sm font-medium text-slate-700">
                  Audio file
                </label>
                <div className="flex flex-col gap-4 p-6 text-center text-indigo-700 border border-indigo-300 border-dashed rounded-xl bg-indigo-50/60">
                  <FaCloudUploadAlt className="w-10 h-10 mx-auto" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">
                      Drag and drop here or choose a file
                    </p>
                    <p className="text-xs text-indigo-600/80">
                      Supports .mp3, .wav · Up to 50 MB
                    </p>
                  </div>
                  <label
                    htmlFor="audioFile"
                    className="inline-flex items-center gap-2 px-4 py-2 mx-auto text-sm font-medium text-white transition bg-indigo-600 rounded-lg shadow-sm cursor-pointer hover:bg-indigo-700"
                  >
                    <FaFileUpload className="w-4 h-4" />
                    Choose file
                    <input
                      id="audioFile"
                      type="file"
                      accept=".mp3,.wav"
                      onChange={handleChange("audioFile")}
                      className="hidden"
                    />
                  </label>
                </div>
                {previewFile && (
                  <div className="p-4 text-sm bg-white border rounded-lg border-slate-200 text-slate-700">
                    <p className="font-medium">{previewFile.name}</p>
                    <p className="text-xs text-slate-500">
                      {previewFile.type} · {previewFile.size} MB
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium transition border rounded-lg border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 text-sm font-semibold text-white transition bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Processing..." : "Save test"}
              </button>
            </div>
          </form>
          <ModalConfirm
            isOpen={showCancelModal}
            onClose={() => setShowCancelModal(false)}
            onConfirm={handleConfirmCancel}
            title="Confirm cancel"
            message="Are you sure you want to cancel? All information will be lost."
            confirmText="Cancel"
            cancelText="Go back"
          />
        </div>
      </section>
    </div>
  );
};

export default CreateTestPage;
