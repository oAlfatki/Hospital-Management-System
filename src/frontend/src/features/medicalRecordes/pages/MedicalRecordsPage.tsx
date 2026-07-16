// import React, { useState, useMemo } from "react";

// import {
//   Search,
//   Eye,
//   Edit2,
//   ShieldAlert,
//   History,
//   Lock,
//   FileText,
//   CheckCircle,
//   Plus,
// } from "lucide-react";
// import {
//   useMedicalRecords,
//   usePatients,
//   useCreateMedicalRecordMutation,
//   useUpdateMedicalRecordMutation,
// } from "@/src/core/services/queries";

// import { Button } from "../../../core/components/ui/Button";
// import { Badge } from "../../../core/components/ui/Badge";
// import { Dialog } from "../../../core/components/ui/Dialog";
// import { Select } from "../../../core/components/ui/Select";
// import type { MedicalRecord } from "../types/MedicalRecord";
// import type { RecordVersion } from "../types/RecordVersion";
// import { useLanguage } from "../../../core/providers/LanguageProvider";
// import { formatDate } from "../../../core/utils/cn";
// import { useForm, type SubmitHandler } from "react-hook-form";
// import type { IMedicalRecordFormInput } from "../types/IMedicalRecordFormInput";

// import { MedicalRecordSchema } from "../validation/createClinicalFileSchema";
// import InputErrorMessage from "../../../core/components/ui/InputErrorMessage";
// import type { TranslationKey } from "../../../core/locales/i18n";
// import { yupResolver } from "@hookform/resolvers/yup";

// interface EnrichedMedicalRecord extends MedicalRecord {
//   patientName: string;
//   contactNumber: string;
// }

// export const MedicalRecordsPage = () => {
//   //const { user } = useAuth();
//   //const { toast } = useToast();
//   const { t, language } = useLanguage();

//   //   const isAuthorized =
//   //     !!user && (user.role === "Doctor" || user.role === "Nurse");

//   //   // Trigger service logs in background if unauthorized, just like original logic
//   //   React.useEffect(() => {
//   //     if (user && !isAuthorized) {
//   //       recordsService.getMedicalRecords(user.role, user.userId).catch(() => {});
//   //     }
//   //   }, [user, isAuthorized]);

//   const { data: rawRecords = [], isLoading: isRecordsLoading } =
//     useMedicalRecords();
//   const { data: patients = [], isLoading: isPatientsLoading } = usePatients();

//   const createRecordMutation = useCreateMedicalRecordMutation();
//   const updateRecordMutation = useUpdateMedicalRecordMutation();

//   const [searchTerm, setSearchTerm] = useState("");

//   // Dialog States
//   const [isEditOpen, setIsEditOpen] = useState(false);
//   const [isHistoryOpen, setIsHistoryOpen] = useState(false);
//   const [isCreateOpen, setIsCreateOpen] = useState(false);

//   const [selectedRecord, setSelectedRecord] =
//     useState<EnrichedMedicalRecord | null>(null);

//   // Form States
//   const [formValues, setFormValues] = useState({
//     patientId: "",
//     diagnosis: "",
//     treatment: "",
//     prescriptions: "",
//     status: "Active" as "Active" | "Archived",
//   });

//   const [errors, setErrors] = useState<Record<string, string>>({});

//   // Dynamic join labels
//   const records = useMemo(() => {
//     return rawRecords.map((r: any) => {
//       const pat = patients.find((p: any) => p.patientId === r.patientId);
//       return {
//         ...r,
//         patientName: pat ? pat.name : t("unknownPatient"),
//         contactNumber: pat ? pat.contactNumber : "",
//       };
//     });
//   }, [rawRecords, patients, t]);

//   const handleInputChange = (
//     e: React.ChangeEvent<
//       HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
//     >,
//   ) => {
//     const { name, value } = e.target;
//     setFormValues((prev) => ({ ...prev, [name]: value }));
//   };

//   //   const validateForm = () => {
//   //     const result = recordSchema.safeParse(formValues);
//   //     if (!result.success) {
//   //       const newErrors: Record<string, string> = {};
//   //       result.error.issues.forEach((err: any) => {
//   //         if (err.path[0]) {
//   //           newErrors[err.path[0].toString()] = err.message;
//   //         }
//   //       });
//   //       setErrors(newErrors);
//   //       return false;
//   //     }
//   //     setErrors({});
//   //     return true;
//   //   };

//   //   const handleCreateSubmit = async (e: React.FormEvent) => {
//   //     e.preventDefault();
//   //     //if (!validateForm() || !user) return;

//   //     createRecordMutation.mutate(
//   //       { recordData: formValues },
//   //       {
//   //         onSuccess: (res: any) => {
//   //           if (res.success) {
//   //             // toast.success(t("toastClinicalRecordInitialized"));
//   //             setIsCreateOpen(false);
//   //             resetForm();
//   //           } else {
//   //             // toast.error(res.error || t("toastFailedCreateRecord"));
//   //           }
//   //         },
//   //         onError: (err: Error) => {
//   //           // toast.error(err.message || t("toastFailedCreateRecord"));
//   //         },
//   //       },
//   //     );
//   //   };

//   const handleEditSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     //  if (!selectedRecord || !user) return;

//     const result = recordSchema.omit({ patientId: true }).safeParse({
//       diagnosis: formValues.diagnosis,
//       treatment: formValues.treatment,
//       prescriptions: formValues.prescriptions,
//       status: formValues.status,
//     });

//     if (!result.success) {
//       const newErrors: Record<string, string> = {};
//       result.error.issues.forEach((err: any) => {
//         if (err.path[0]) {
//           newErrors[err.path[0].toString()] = err.message;
//         }
//       });
//       setErrors(newErrors);
//       return;
//     }
//     setErrors({});

//     updateRecordMutation.mutate(
//       {
//         recordId: selectedRecord.recordId,
//         updates: {
//           diagnosis: formValues.diagnosis,
//           treatment: formValues.treatment,
//           prescriptions: formValues.prescriptions,
//           status: formValues.status,
//         },
//       },
//       {
//         onSuccess: (res: any) => {
//           if (res.success) {
//             // toast.success(t("toastMedicalRecordUpdated"));
//             setIsEditOpen(false);
//             setSelectedRecord(null);
//             resetForm();
//           } else {
//             // toast.error(res.error || t("toastFailedUpdateRecord"));
//           }
//         },
//         onError: (err: Error) => {
//           // toast.error(err.message || t("toastFailedUpdateRecord"));
//         },
//       },
//     );
//   };

//   const openCreateDialog = () => {
//     resetForm();
//     setIsCreateOpen(true);
//   };

//   const openEditDialog = (record: EnrichedMedicalRecord) => {
//     setSelectedRecord(record);
//     setFormValues({
//       patientId: record.patientId,
//       diagnosis: record.diagnosis,
//       treatment: record.treatment,
//       prescriptions: record.prescriptions,
//       status: record.status,
//     });
//     setErrors({});
//     setIsEditOpen(true);
//   };

//   const openHistoryDialog = (record: EnrichedMedicalRecord) => {
//     setSelectedRecord(record);
//     setIsHistoryOpen(true);
//   };

//   const resetForm = () => {
//     setFormValues({
//       patientId: patients[0]?.patientId || "",
//       diagnosis: "",
//       treatment: "",
//       prescriptions: "",
//       status: "Active",
//     });
//     setErrors({});
//   };

//   // Quick search filtration
//   const filteredRecords = records.filter((r: any) => {
//     return (
//       r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       r.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       r.contactNumber.includes(searchTerm) ||
//       r.recordId.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//   });

//   //   // Access Denied Shield Page if not authorized
//   //   if (!isAuthorized) {
//   //     return (
//   //       <div className="flex flex-col items-center justify-center p-8 md:p-16 text-center max-w-xl mx-auto space-y-6 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 shadow-xl rounded-xl mt-12">
//   //         <div className="h-16 w-16 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500">
//   //           <ShieldAlert className="h-9 w-9" />
//   //         </div>
//   //         <div className="space-y-2">
//   //           <h2 className="text-xl font-bold text-slate-800 dark:text-white">
//   //             {t("rbacProtectedClinicalRecords")}
//   //           </h2>
//   //           <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
//   //             {t("rbacProtectedClinicalRecordsDesc")}
//   //           </p>
//   //         </div>
//   //         <div className="p-3.5 bg-slate-50 dark:bg-slate-950/45 rounded-lg border border-slate-100 dark:border-slate-850 w-full text-left">
//   //           <div className="flex items-center gap-2.5 text-xs text-rose-500 font-bold uppercase tracking-wider mb-1">
//   //             <Lock className="h-4 w-4" />
//   //             {t("securityAuditAlert")}
//   //           </div>
//   //           <p className="text-xs text-slate-400 dark:text-slate-500">
//   //             {t("unauthorizedLogAlert")}{" "}
//   //             <span className="font-semibold font-mono text-rose-500">
//   //               {user?.userId}
//   //             </span>
//   //             .
//   //           </p>
//   //         </div>
//   //       </div>
//   //     );
//   //   }

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     reset,
//   } = useForm<IMedicalRecordFormInput>({
//     resolver: yupResolver(MedicalRecordSchema),
//     defaultValues: {
//       patientId: "",
//       diagnosis: "",
//       treatment: "",
//       prescriptions: "",
//       status: "Active",
//     },
//   });

//   const {
//     register: editRegister,
//     handleSubmit: handleEditFormSubmit,
//     reset: resetEditForm,
//     formState: { errors: editErrors },
//   } = useForm<IMedicalRecordFormInput>({
//     resolver: yupResolver(MedicalRecordSchema),
//     defaultValues: {
//       patientId: "",
//       diagnosis: "",
//       treatment: "",
//       prescriptions: "",
//       status: "Active",
//     },
//   });

//   const onSubmit: SubmitHandler<IMedicalRecordFormInput> = (data) => {
//     console.log(data);

//     setIsCreateOpen(false);

//     reset();
//   };

//   const onEditSubmit: SubmitHandler<IMedicalRecordFormInput> = (data) => {
//     console.log(data);

//     // هنا لاحقًا سنضع updateRecordMutation
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
//             {t("medicalRecordsManagement")}
//           </h1>
//           <p className="text-sm text-slate-500 dark:text-slate-400">
//             {t("medicalRecordsManagementDesc")}
//           </p>
//         </div>
//         <div className="flex items-center gap-2">
//           <Button onClick={openCreateDialog} className="gap-2 h-9 text-xs">
//             <Plus className="h-4 w-4" />
//             {t("newClinicalFile")}
//           </Button>
//         </div>
//       </div>

//       {/* Search Filter */}
//       <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center">
//         <div className="relative w-full">
//           <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
//           <input
//             type="text"
//             placeholder={t("quickSearchRecordsPlaceholder")}
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 focus:bg-white dark:bg-slate-950/45 border border-slate-200/85 dark:border-slate-800 rounded-lg outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:text-slate-100"
//           />
//         </div>
//       </div>

//       {/* Record Listings Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//         {filteredRecords.length === 0 ? (
//           <div className="col-span-1 md:col-span-2 py-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-855 font-medium">
//             {t("noClinicalRecordsMatching")}
//           </div>
//         ) : (
//           filteredRecords.map((rec: any) => (
//             <div
//               key={rec.recordId}
//               className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-5 rounded-xl shadow-sm space-y-4 relative overflow-hidden flex flex-col"
//             >
//               {/* Card Ribbon header */}
//               <div className="flex items-start justify-between">
//                 <div>
//                   <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">
//                     {rec.patientName}
//                   </h3>
//                   <p className="text-xs font-mono text-slate-400 mt-0.5">
//                     {language === "ar" ? "معرف المريض" : "Patient ID"}:{" "}
//                     {rec.patientId} • {language === "ar" ? "السجل" : "Record"}:{" "}
//                     {rec.recordId}
//                   </p>
//                 </div>
//                 <div className="flex items-center gap-1.5 font-bold">
//                   <Badge variant="info">v{rec.version}</Badge>
//                   <Badge
//                     variant={rec.status === "Active" ? "success" : "neutral"}
//                   >
//                     {rec.status === "Active"
//                       ? t("commonActive")
//                       : t("commonArchived")}
//                   </Badge>
//                 </div>
//               </div>

//               {/* Clinical diagnostics and treatments details */}
//               <div className="space-y-3 flex-1 font-medium">
//                 <div>
//                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
//                     {t("diagnosisCol")}
//                   </p>
//                   <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1 bg-slate-50 dark:bg-slate-950/30 p-2.5 rounded border border-slate-100 dark:border-slate-850">
//                     {rec.diagnosis}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
//                     {t("treatmentPlanCol")}
//                   </p>
//                   <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">
//                     {rec.treatment || t("noActiveTherapySpecified")}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
//                     {t("activePrescriptionsCol")}
//                   </p>
//                   <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-mono line-clamp-1">
//                     {rec.prescriptions || t("noDrugsPrescribed")}
//                   </p>
//                 </div>
//               </div>

//               {/* AES-256 Simulated Encryption footnote */}
//               <p className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-500/5 px-2 py-1 rounded inline-flex items-center gap-1 w-max">
//                 <CheckCircle className="h-3 w-3" />{" "}
//                 {t("secureAesEncryptedFootnote")}
//               </p>

//               {/* Action buttons */}
//               <div className="border-t border-slate-50 dark:border-slate-850 pt-3.5 flex items-center justify-between font-bold">
//                 <p className="text-[10px] text-slate-400 font-semibold">
//                   {t("lastUpdatedPrefix")}{" "}
//                   {formatDate(
//                     rec.updatedOn,
//                     language === "ar" ? "ar-EG" : "en-US",
//                   )}
//                 </p>
//                 <div className="flex items-center gap-1.5">
//                   <Button
//                     variant="ghost"
//                     onClick={() => openHistoryDialog(rec)}
//                     className="h-8 gap-1.5 px-3 text-xs text-slate-500 hover:text-emerald-500"
//                   >
//                     <History className="h-3.5 w-3.5" />
//                     {t("vHistoryBtn")} ({rec.history.length})
//                   </Button>
//                   <Button
//                     variant="secondary"
//                     onClick={() => openEditDialog(rec)}
//                     className="h-8 gap-1.5 px-3 text-xs bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
//                   >
//                     <Edit2 className="h-3.5 w-3.5" />
//                     {t("modifyRecordBtn")}
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           ))
//         )}
//       </div>

//       {/* Create Medical Record Dialog */}

//       <Dialog
//         isOpen={isCreateOpen}
//         onClose={() => setIsCreateOpen(false)}
//         title={t("initializePatientClinicalFile")}
//         footer={
//           <>
//             <Button
//               variant="outline"
//               onClick={() => setIsCreateOpen(false)}
//               className="h-9"
//             >
//               {t("commonCancel")}
//             </Button>
//             <Button type="submit" form="createClinicalFileForm" className="h-9">
//               {t("saveClinicalFileFileBtn")}
//             </Button>
//           </>
//         }
//       >
//         <form
//           id="createClinicalFileForm"
//           onSubmit={handleSubmit(onSubmit)}
//           className="space-y-4"
//         >
//           <Select
//             label={t("selectRegisteredPatientFile")}
//             name="patientId"
//             value={formValues.patientId}
//             onChange={handleInputChange}
//             options={[
//               { value: "", label: t("selectPatientOption") },
//               ...patients.map((p: any) => ({
//                 value: p.patientId,
//                 label: `${p.name} (${p.patientId})`,
//               })),
//             ]}
//           />

//           <div>
//             <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
//               {t("clinicalDiagnosisActive")}
//             </label>
//             <textarea
//               {...register("diagnosis")}
//               rows={2}
//               placeholder={t("primaryActiveDiagnosticsPlaceholder")}
//               className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100"
//             />
//             {errors.diagnosis && (
//               <InputErrorMessage
//                 msg={t(errors.diagnosis.message as TranslationKey)}
//               />
//             )}
//           </div>

//           <div>
//             <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
//               {t("prescribedTreatmentDetails")}
//             </label>
//             <textarea
//               {...register("treatment")}
//               rows={3}
//               placeholder={t("therapyPlansPlaceholder")}
//               className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100"
//             />

//             {errors.treatment && (
//               <InputErrorMessage
//                 msg={t(errors.treatment.message as TranslationKey)}
//               />
//             )}
//           </div>

//           <div>
//             <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
//               {t("activePrescriptionsDrugLists")}
//             </label>
//             <textarea
//               {...register("prescriptions")}
//               rows={2}
//               placeholder={t("activePrescriptionsPlaceholder")}
//               className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 font-mono"
//             />

//             {errors.prescriptions && (
//               <InputErrorMessage
//                 msg={t(errors.prescriptions.message as TranslationKey)}
//               />
//             )}
//           </div>

//           <Select
//             label={t("patientFileStatus")}
//             name="status"
//             value={formValues.status}
//             onChange={handleInputChange}
//             options={[
//               { value: "Active", label: t("commonActive") },
//               { value: "Archived", label: t("commonArchived") },
//             ]}
//           />
//         </form>
//       </Dialog>

//       {/* Edit Medical Record Dialog */}
//       <Dialog
//         isOpen={isEditOpen}
//         onClose={() => {
//           setIsEditOpen(false);
//           setSelectedRecord(null);
//         }}
//         title={t("updatePatientMedicalFile")}
//         footer={
//           <>
//             <Button
//               variant="outline"
//               onClick={() => {
//                 setIsEditOpen(false);
//                 setSelectedRecord(null);
//               }}
//               className="h-9"
//             >
//               {t("commonCancel")}
//             </Button>
//             <Button onClick={handleEditSubmit} className="h-9">
//               {t("compileUpdateBtn")}
//             </Button>
//           </>
//         }
//       >
//         <form
//           id="editClinicalFileForm"
//           onSubmit={handleEditFormSubmit(onEditSubmit)}
//           className="space-y-4"
//         >
//           <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-lg">
//             <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
//               {t("editingMedicalRecordFor")}
//             </p>
//             <p className="text-sm font-bold mt-1 text-slate-800 dark:text-slate-200">
//               {selectedRecord?.patientName} • ID {selectedRecord?.patientId}
//             </p>
//             <p className="text-[10px] text-slate-400 mt-1 font-mono">
//               {t("currentVersionPrefix")} v{selectedRecord?.version}
//             </p>
//           </div>

//           <div>
//             <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
//               {t("clinicalDiagnosisActive")}
//             </label>
//             <textarea
//               {...editRegister("diagnosis")}
//               rows={2}
//               className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100"
//             />

//             {editErrors.diagnosis && (
//               <InputErrorMessage
//                 msg={t(editErrors.diagnosis.message as TranslationKey)}
//               />
//             )}
//           </div>

//           <div>
//             <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
//               {t("prescribedTreatmentDetails")}
//             </label>
//             <textarea
//               {...editRegister("treatment")}
//               rows={3}
//               className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100"
//             />

//             {editErrors.treatment && (
//               <InputErrorMessage
//                 msg={t(editErrors.treatment.message as TranslationKey)}
//               />
//             )}
//           </div>

//           <div>
//             <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
//               {t("activePrescriptionsDrugLists")}
//             </label>
//             <textarea
//               {...editRegister("prescriptions")}
//               rows={2}
//               className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 font-mono"
//             />

//             {editErrors.prescriptions && (
//               <InputErrorMessage
//                 msg={t(editErrors.prescriptions.message as TranslationKey)}
//               />
//             )}
//           </div>

//           <Select
//             label={t("patientFileStatus")}
//             error={
//               editErrors.status
//                 ? t(editErrors.status.message as TranslationKey)
//                 : undefined
//             }
//             options={[
//               { value: "Active", label: t("commonActive") },
//               { value: "Archived", label: t("commonArchived") },
//             ]}
//             {...editRegister("status")}
//           />
//         </form>
//       </Dialog>

//       {/* Historical Versioning Dialog */}
//       <Dialog
//         isOpen={isHistoryOpen}
//         onClose={() => {
//           setIsHistoryOpen(false);
//           setSelectedRecord(null);
//         }}
//         title={t("clinicalDiagnosticVersionHistory")}
//       >
//         <div className="space-y-4">
//           <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-lg">
//             <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
//               {t("historicalVersionLedgerFor")}
//             </p>
//             <p className="text-sm font-bold mt-1 text-slate-800 dark:text-slate-200">
//               {selectedRecord?.patientName} • ID {selectedRecord?.patientId}
//             </p>
//           </div>

//           <div className="space-y-4">
//             {/* Current Active Version */}
//             <div className="border border-emerald-100 dark:border-emerald-500/10 p-4 rounded-lg bg-emerald-50/20 dark:bg-emerald-500/5 space-y-2.5">
//               <div className="flex items-center justify-between border-b border-emerald-100/50 dark:border-emerald-500/10 pb-1.5">
//                 <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">
//                   {t("versionCurrentActive")} {selectedRecord?.version}
//                 </span>
//                 <span className="text-xs text-slate-400">
//                   {t("updatedPrefix")}{" "}
//                   {selectedRecord
//                     ? formatDate(
//                         selectedRecord.updatedOn,
//                         language === "ar" ? "ar-EG" : "en-US",
//                       )
//                     : ""}
//                 </span>
//               </div>
//               <div>
//                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
//                   {t("diagnosisCol")}
//                 </p>
//                 <p className="text-sm text-slate-800 dark:text-slate-200 font-semibold mt-0.5">
//                   {selectedRecord?.diagnosis}
//                 </p>
//               </div>
//               <div>
//                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
//                   {t("prescribedTreatmentDetails")}
//                 </p>
//                 <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
//                   {selectedRecord?.treatment}
//                 </p>
//               </div>
//               <div>
//                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
//                   {t("activePrescriptionsDrugLists")}
//                 </p>
//                 <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-mono">
//                   {selectedRecord?.prescriptions}
//                 </p>
//               </div>
//             </div>

//             {/* Historical Versions Comparison List */}
//             {selectedRecord?.history.length === 0 ? (
//               <p className="text-center text-xs text-slate-400 py-6">
//                 {t("noPreviousArchivedVersions")}
//               </p>
//             ) : (
//               selectedRecord?.history.map((hist: RecordVersion) => (
//                 <div
//                   key={hist.version}
//                   className="border border-slate-100 dark:border-slate-850 p-4 rounded-lg bg-slate-50/40 dark:bg-slate-950/20 space-y-2.5"
//                 >
//                   <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
//                     <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
//                       {t("versionArchived")} {hist.version}
//                     </span>
//                     <span className="text-xs text-slate-400">
//                       {t("updatedPrefix")}{" "}
//                       {formatDate(
//                         hist.updatedOn,
//                         language === "ar" ? "ar-EG" : "en-US",
//                       )}
//                     </span>
//                   </div>
//                   <div>
//                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
//                       {t("diagnosisCol")}
//                     </p>
//                     <p className="text-sm text-slate-700 dark:text-slate-300 font-semibold mt-0.5">
//                       {hist.diagnosis}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
//                       {t("prescribedTreatmentDetails")}
//                     </p>
//                     <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
//                       {hist.treatment}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
//                       {t("activePrescriptionsDrugLists")}
//                     </p>
//                     <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
//                       {hist.prescriptions}
//                     </p>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       </Dialog>
//     </div>
//   );
// };
