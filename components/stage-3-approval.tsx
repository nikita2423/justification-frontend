"use client";

import { useState, useCallback, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  ChevronLeft,
  Sparkles,
  Search,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  FileText,
  RefreshCw,
  History,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useProductStore } from "@/lib/store";
import { useSimilarMatches } from "@/hooks/use-similar-matches";
import { useGetCases } from "@/hooks/use-get-cases";
import { useUpdateCaseStatus } from "@/hooks/use-update-case-status";
import { useAuth } from "@/lib/auth-context";
import type {
  Product,
  SimilarJustification,
  SimilarCaseAnalysis,
} from "@/lib/types";
import type { Case } from "@/app/api/cases/types";

// Mock AI justification generation
const generateJustification = async (
  products: Product[],
  decision: "approved" | "rejected",
): Promise<string> => {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const productNames = products.map((p) => p.name).join(", ");

  if (decision === "approved") {
    return `Based on the comprehensive review of ${products.length} product(s) (${productNames}), the following approval justification is provided:

1. Documentation Completeness: All required files including specifications, certifications, product images, and documentation have been verified and meet the organizational standards.

2. Data Integrity: Product information including SKU, pricing, and inventory quantities have been validated against source documents and confirmed accurate.

3. Compliance Check: Products meet regulatory requirements and internal compliance standards based on the certification documents provided.

4. Quality Assessment: Product specifications align with category standards and pricing reflects market positioning appropriately.

Recommendation: APPROVE for listing in the product catalog.`;
  } else {
    return `Based on the review of ${products.length} product(s) (${productNames}), the following rejection justification is provided:

1. Documentation Issues: Some required documentation may be incomplete or require additional verification before approval can be granted.

2. Data Verification Needed: Certain product attributes require clarification or additional supporting documentation.

3. Compliance Concerns: Additional compliance documentation may be needed to meet regulatory requirements.

4. Quality Review: Product specifications need further review to ensure alignment with category standards.

Recommendation: REJECT and return for additional documentation or corrections.`;
  }
};

const getSimilarCases = async (
  products: Product[],
): Promise<SimilarCaseAnalysis> => {
  await new Promise((resolve) => setTimeout(resolve, 1200));

  const categories = [
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];
  const primaryCategory = categories[0] || "Electronics";

  const cases: SimilarJustification[] = [
    {
      id: "1",
      productName: "Wireless Bluetooth Headphones",
      category: primaryCategory,
      decision: "approved",
      justification:
        "Approved due to complete documentation, verified supplier credentials, and competitive pricing structure.",
      similarity: 0.94,
    },
    {
      id: "2",
      productName: "Smart LED Display Monitor",
      category: primaryCategory,
      decision: "approved",
      justification:
        "Met all compliance requirements with valid certifications and complete technical specifications.",
      similarity: 0.89,
    },
    {
      id: "3",
      productName: "USB-C Charging Hub",
      category: primaryCategory,
      decision: "approved",
      justification:
        "Full documentation package with verified safety certifications and quality assurance reports.",
      similarity: 0.85,
    },
    {
      id: "4",
      productName: "Portable Power Bank",
      category: primaryCategory,
      decision: "rejected",
      justification:
        "Rejected due to missing safety certification documents and incomplete supplier verification.",
      similarity: 0.82,
    },
    {
      id: "5",
      productName: "Wireless Keyboard Set",
      category: primaryCategory,
      decision: "rejected",
      justification:
        "Missing required compliance documentation and product specifications did not match samples.",
      similarity: 0.78,
    },
    {
      id: "6",
      productName: "Digital Camera Module",
      category: primaryCategory,
      decision: "approved",
      justification:
        "Comprehensive documentation with verified quality standards and competitive market positioning.",
      similarity: 0.76,
    },
  ];

  const approvedCount = cases.filter((c) => c.decision === "approved").length;
  const totalCases = cases.length;

  return {
    totalCases,
    approvalRate: Math.round((approvedCount / totalCases) * 100),
    rejectionRate: Math.round(
      ((totalCases - approvedCount) / totalCases) * 100,
    ),
    commonApprovalFactors: [
      "Complete documentation package",
      "Valid safety certifications",
      "Verified supplier credentials",
      "Competitive pricing structure",
      "Quality assurance reports provided",
    ],
    commonRejectionFactors: [
      "Missing certification documents",
      "Incomplete supplier verification",
      "Specification discrepancies",
      "Non-compliant packaging info",
      "Insufficient product images",
    ],
    cases,
  };
};

// Keep existing mock for backward compatibility
const getSimilarJustifications = async (
  products: Product[],
): Promise<SimilarJustification[]> => {
  const analysis = await getSimilarCases(products);
  return analysis.cases.slice(0, 3);
};

interface Stage3ApprovalProps {
  onBack: () => void;
  onComplete: () => void;
}

export function Stage3Approval({ onBack, onComplete }: Stage3ApprovalProps) {
  const {
    products,
    selectedProducts,
    toggleProductSelection,
    clearSelection,
    updateProduct,
    similarJustifications,
    setSimilarJustifications,
    isGeneratingJustification,
    setIsGeneratingJustification,
  } = useProductStore();

  const {
    matches,
    loading: isLoadingSimilarMatches,
    fetchSimilarMatches,
  } = useSimilarMatches();

  // Get current user
  const { user } = useAuth();

  // Fetch cases from API filtered by userId
  const { cases, setCases, isLoading: isLoadingCases, error: casesError, refetch: refetchCases } = useGetCases(
    user?.id ? { userId: user.id } : undefined
  );

  // Update case status and justification
  const { updateCaseStatus, isLoading: isUpdatingCase } = useUpdateCaseStatus();

  console.log("Cases from API:", cases);
  console.log("Products in Stage3Approval:", products);

  const [searchQuery, setSearchQuery] = useState("");
  const [generatedJustification, setGeneratedJustification] = useState("");
  const [pendingDecision, setPendingDecision] = useState<
    "approved" | "rejected" | null
  >(null);
  const [similarCaseAnalysis, setSimilarCaseAnalysis] =
    useState<SimilarCaseAnalysis | null>(null);
  const [isLoadingSimilarCases, setIsLoadingSimilarCases] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Clear similar cases data when product selection changes
  useEffect(() => {
    setSimilarCaseAnalysis(null);
    setGeneratedJustification("");
    setPendingDecision(null);
    setIsLoadingSimilarCases(false);
  }, [selectedProducts.join(",")]); // Re-run when selected products change

  const pendingProducts = products.filter((p) => p.status === "pending_review");

  const filteredProducts = pendingProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const selectedProductObjects = products.filter((p) =>
    selectedProducts.includes(p.id),
  );

  const handleRetrieveSimilarCases = useCallback(async () => {
    if (selectedProducts.length === 0) return;

    setIsLoadingSimilarCases(true);
    setSimilarCaseAnalysis(null);

    try {
      // Get the first selected case
      const selectedCaseId = selectedProducts[0];
      const selectedCase = cases.find((c) => c.id === selectedCaseId);
      
      if (!selectedCase) {
        console.error("Selected case not found");
        return;
      }

      console.log("Selected case for similar matches:", selectedCase);

      // Extract product information from catalogueData
      const productInfo = selectedCase.catalogueData?.products?.[0];
      const productName = productInfo?.product_name || "";
      const description = productInfo?.description || selectedCase.catalogueData?.description || "";
      
      // Extract category from applicationData
      const category = selectedCase.applicationData?.PA_Cat || selectedCase.categoryId || "";
      
      console.log("Searching for similar cases with:", {
        productName,
        category,
        description: description.substring(0, 100) + "...",
      });

      // Call the similar matches API
      await fetchSimilarMatches({
        item: {
          PA_Cat: category,
          desc: description,
        },
        srcField: "PA_Cat",
        datasetName: "Justification Creation",
        datasetType: "justification-testing",
        dstField: "RefL_Cat",
        descriptionField: "desc",
      });

      console.log("Similar matches found:", matches);

      // Transform API results to similar justifications format
      const transformedCases: SimilarJustification[] = matches.map((match) => {
        const approvalStatus =
          match.approvalStatus || match.metadata?.Q12a_T4 || "";
        console.log("approvalStatus", approvalStatus);
        const decision =
          approvalStatus === "Y"
            ? ("approved" as const)
            : ("rejected" as const);

        return {
          id: match.id,
          productName: match.name,
          category: match.category,
          decision: decision,
          justification: match.description || "Similar case found in dataset",
          similarity: match.similarity,
          approvalStatus: approvalStatus,
          metadata: match.metadata,
        };
      });

      setSimilarJustifications(transformedCases);

      // Create case analysis summary
      const approvedCount = transformedCases.filter(
        (c) => c.decision === "approved",
      ).length;
      const analysis: SimilarCaseAnalysis = {
        totalCases: transformedCases.length,
        approvalRate: Math.round(
          (approvedCount / Math.max(transformedCases.length, 1)) * 100,
        ),
        rejectionRate: Math.round(
          ((transformedCases.length - approvedCount) /
            Math.max(transformedCases.length, 1)) *
            100,
        ),
        commonApprovalFactors: [
          "Similar product categories found",
          "Matching dataset records identified",
          "Reference data available",
        ],
        commonRejectionFactors: [],
        cases: transformedCases,
      };

      setSimilarCaseAnalysis(analysis);
    } finally {
      setIsLoadingSimilarCases(false);
    }
  }, [
    selectedProducts,
    cases,
    fetchSimilarMatches,
    matches?.length,
    setSimilarJustifications,
  ]);

  useEffect(() => {
    const transformedCases: SimilarJustification[] = matches.map((match) => {
      const approvalStatus =
        match.approvalStatus || match.metadata?.Q12a_T4 || "";
      console.log("approvalStatus", approvalStatus);
      const decision =
        approvalStatus === "Y" ? ("approved" as const) : ("rejected" as const);

      return {
        id: match.id,
        productName: match.name,
        category: match.category,
        decision: decision,
        justification: match.description || "Similar case found in dataset",
        similarity: match.similarity,
        approvalStatus: approvalStatus,
        metadata: match.metadata,
      };
    });

    setSimilarJustifications(transformedCases);

    // Create case analysis summary
    const approvedCount = transformedCases.filter(
      (c) => c.decision === "approved",
    ).length;
    const analysis: SimilarCaseAnalysis = {
      totalCases: transformedCases.length,
      approvalRate: Math.round(
        (approvedCount / Math.max(transformedCases.length, 1)) * 100,
      ),
      rejectionRate: Math.round(
        ((transformedCases.length - approvedCount) /
          Math.max(transformedCases.length, 1)) *
          100,
      ),
      commonApprovalFactors: [
        "Similar product categories found",
        "Matching dataset records identified",
        "Reference data available",
      ],
      commonRejectionFactors: [],
      cases: transformedCases,
    };

    setSimilarCaseAnalysis(analysis);
  }, [JSON.stringify(matches)]);

  const handleGenerateJustification = useCallback(
    async (decision: "approved" | "rejected") => {
      if (selectedProducts.length === 0) return;

      setIsGeneratingJustification(true);
      setPendingDecision(decision);
      setGeneratedJustification("");
      setSimilarJustifications([]);

      try {
        const justifications: string[] = [];
        const allSimilarJustifications: SimilarJustification[] = [];

        // Process each selected case
        for (const caseId of selectedProducts) {
          const selectedCase = cases.find((c) => c.id === caseId);
          if (!selectedCase) continue;

          // Extract product information from catalogueData
          const productInfo = selectedCase.catalogueData?.products?.[0];
          const productName = productInfo?.product_name || "";
          const description = productInfo?.description || selectedCase.catalogueData?.description || "";
          
          // Extract category from applicationData
          const category = selectedCase.applicationData?.PA_Cat || selectedCase.categoryId || "";

          console.log(`Generating justification for case ${selectedCase.caseNumber}:`, {
            productName,
            category,
          });

          // Fetch similar matches for this case
          try {
            await fetchSimilarMatches({
              item: {
                PA_Cat: category,
                desc: description,
              },
              srcField: "PA_Cat",
              datasetName: "Justification Creation",
              datasetType: "justification-testing",
              dstField: "RefL_Cat",
              descriptionField: "desc",
            });
          } catch (err) {
            console.error(
              `Failed to fetch similar matches for ${productName}`,
              err,
            );
          }

          // Call justification API for this case
          const similarMatches =
            matches
              ?.filter((c) => c.similarity > 0.5)
              .map((c) => ({
                Justify: c.description || "Similar case found",
                Prod_Name: c.name,
                Status: c.metadata?.Q12a_T4 || "",
                Model_Code: c.metadata?.Model_Code || "",
                Desc: c.metadata?.RefL_Des || "",
              })) || [];

          const currentCase = selectedCase.catalogueData?.products;
          const appData = selectedCase.applicationData || {};

          try {
            const response = await fetch("/api/suggest/justification", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                similar_matches: similarMatches,
                current_case: currentCase,
                application_data: appData,
              }),
            });

            if (response.ok) {
              const result = await response.json();
              console.log("Result Justification", result);
              justifications.push(result?.data?.justification || "");
            } else {
              // Fallback to mock if API fails
              const mockProduct = {
                id: selectedCase.id,
                name: productName,
                sku: selectedCase.caseNumber,
                category: category,
              } as Product;
              const justification = await generateJustification(
                [mockProduct],
                decision,
              );
              justifications.push(justification);
            }
          } catch (error) {
            console.error(
              `Error generating justification for ${productName}:`,
              error,
            );
            const mockProduct = {
              id: selectedCase.id,
              name: productName,
              sku: selectedCase.caseNumber,
              category: category,
            } as Product;
            const justification = await generateJustification(
              [mockProduct],
              decision,
            );
            justifications.push(justification);
          }
        }

        // Use justification from first case for display
        setGeneratedJustification(justifications[0] || "");
      } finally {
        setIsGeneratingJustification(false);
      }
    },
    [
      selectedProducts,
      cases,
      fetchSimilarMatches,
      matches,
      setIsGeneratingJustification,
      setSimilarJustifications,
    ],
  );

  const handleConfirmDecision = useCallback(async () => {
    if (!pendingDecision || !generatedJustification) return;

    try {
      setIsGeneratingJustification(true);

      console.log(`Confirming ${pendingDecision} decision for ${selectedProducts.length} case(s)`);

      // Update each selected case with status and justification
      const updatePromises = selectedProducts.map(async (caseId) => {
        const selectedCase = cases.find((c) => c.id === caseId);
        if (!selectedCase) {
          console.warn(`Case ${caseId} not found`);
          return null;
        }

        console.log(`Updating case ${selectedCase.caseNumber}:`, {
          status: pendingDecision,
          justification: generatedJustification.substring(0, 100) + "...",
        });

        return updateCaseStatus(caseId, {
          status: pendingDecision,
          justification: generatedJustification,
        });
      });

      const results = await Promise.all(updatePromises);

      // Check for failures
      const failedUpdates = results.filter((r) => !r || !r.success);
      
      if (failedUpdates.length > 0) {
        // Fallback: Update local state if API failed
        setCases((currentCases) => 
          currentCases.map((c) => 
            selectedProducts.includes(c.id) 
              ? { ...c, status: pendingDecision, justification: generatedJustification }
              : c
          )
        );

        alert(
          `Warning: ${failedUpdates.length} case(s) failed to save to server, but updated locally.`
        );
      } else {
        console.log(`Successfully updated ${results.length} case(s) with ${pendingDecision} status`);
        alert(
          `Successfully ${pendingDecision} ${results.length} case(s) with AI-generated justification.`
        );
        // Refresh cases list to ensure sync with server
        await refetchCases();
      }

      // Also update local product statuses for backward compatibility
      selectedProducts.forEach((id) => {
        updateProduct(id, { status: pendingDecision });
      });
    } catch (error) {
      console.error("Error confirming decision:", error);
      
      // Fallback: Update local state on error
      setCases((currentCases) => 
        currentCases.map((c) => 
          selectedProducts.includes(c.id) 
            ? { ...c, status: pendingDecision, justification: generatedJustification }
            : c
        )
      );

      alert("Error reaching server. Table updated locally.");
    } finally {
      setIsGeneratingJustification(false);

      // Clear state
      clearSelection();
      setGeneratedJustification("");
      setSimilarJustifications([]);
      setPendingDecision(null);
      setSimilarCaseAnalysis(null);
    }
  }, [
    pendingDecision,
    generatedJustification,
    selectedProducts,
    cases,
    setCases,
    updateCaseStatus,
    refetchCases,
    updateProduct,
    clearSelection,
    setSimilarJustifications,
    setIsGeneratingJustification,
  ]);

  const handleSelectAll = useCallback(() => {
    if (selectedProducts.length === filteredProducts.length) {
      clearSelection();
    } else if (filteredProducts.length > 0) {
      clearSelection();
      toggleProductSelection(filteredProducts[0].id);
    }
  }, [
    filteredProducts,
    selectedProducts,
    clearSelection,
    toggleProductSelection,
  ]);

  const handleSelectProduct = useCallback(
    (productId: string) => {
      clearSelection();
      toggleProductSelection(productId);
    },
    [clearSelection, toggleProductSelection],
  );

  const approvedCount = products.filter((p) => p.status === "approved").length;
  const rejectedCount = products.filter((p) => p.status === "rejected").length;

  console.log("Matrches Fetched", matches);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Approval Workflow
          </h2>
          <p className="text-muted-foreground mt-1">
            Select products and submit for AI-assisted approval decisions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <CheckCircle2 className="w-3 h-3 text-success" />
            {approvedCount} approved
          </Badge>
          <Badge variant="outline" className="gap-1">
            <XCircle className="w-3 h-3 text-destructive" />
            {rejectedCount} rejected
          </Badge>
          <Badge variant="secondary" className="gap-1">
            {pendingProducts.length} pending
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cases Selection Table */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg">Pending Cases</CardTitle>
                  {isLoadingCases && (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  )}
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search cases..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refetchCases}
                    disabled={isLoadingCases}
                    className="gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingCases ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {casesError && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
                  <p className="font-semibold">Error loading cases</p>
                  <p className="text-sm">{casesError}</p>
                </div>
              )}

              {isLoadingCases ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="ml-3 text-muted-foreground">Loading cases...</span>
                </div>
              ) : cases.length > 0 ? (
                <div className="rounded-lg border overflow-hidden overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-12 sticky left-0 bg-muted/50 z-10">
                          <Checkbox
                            checked={
                              selectedProducts.length === cases.length &&
                              cases.length > 0
                            }
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        {/* Priority columns first */}
                        <TableHead className="font-semibold whitespace-nowrap px-4 bg-primary/5">
                          Case Number
                        </TableHead>
                        <TableHead className="font-semibold whitespace-nowrap px-4 bg-primary/5">
                          Status
                        </TableHead>
                        <TableHead className="font-semibold whitespace-nowrap px-4 bg-primary/5">
                          Product Name
                        </TableHead>
                        <TableHead className="font-semibold whitespace-nowrap px-4 bg-primary/5">
                          Ref No
                        </TableHead>
                        {/* Other EG data columns */}
                        {[
                          "App_No",
                          "Tranche",
                          "EB_RM",
                          "NO",
                          "NO_R",
                          "Staff",
                          "D_ReqF_SWD",
                          "D_PlnT_SWD",
                          "D_EGF_Out",
                          "D_EGF_Dead",
                          "SWD_Off_N",
                          "SWD_Off_P",
                          "SWD_Off_I",
                          "App_Type",
                          "App_Cat",
                          "Rem_RA",
                          "Recd_EGF",
                          "Recd_PAF",
                          "Recd_Quo",
                          "Recd_Cat",
                          "Ret_Rept",
                          "MRef",
                          "Req_I_SWD_YN",
                          "D_ReqT_SWD",
                          "Req_RepSWD_YN",
                          "D_RetF_SWD",
                          "Rem_Req",
                          "D_WkRep",
                          "WkRep_Status",
                          "WkRep_Rem",
                          "RecdCurrWk_YN",
                          "EGF_Ready_YN",
                          "EGF_To_EG_YN",
                          "D_EGF_T_EG",
                          "EG_Reply_YN",
                          "D_EG_Reply",
                          "Rem_EG",
                          "EGF_To_SWD_YN",
                          "D_EGF_ASWD",
                          "FUF_Comp_YN",
                          "DatEntry",
                        ].map((col) => (
                          <TableHead
                            key={col}
                            className="whitespace-nowrap px-4"
                          >
                            {col}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cases
                        .filter((caseItem) => {
                          // Filter by search query
                          const searchLower = searchQuery.toLowerCase();
                          const productName = caseItem.egData?.App_PNam_Mod || caseItem.applicationData?.PA_PName || "";
                          return (
                            caseItem.caseNumber.toLowerCase().includes(searchLower) ||
                            productName.toLowerCase().includes(searchLower)
                          );
                        })
                        .map((caseItem) => {
                          const isSelected = selectedProducts.includes(caseItem.id);
                          
                          // Extract product name from egData or applicationData
                          const productName = caseItem.egData?.App_PNam_Mod || 
                                            caseItem.applicationData?.PA_PName || 
                                            "—";
                          
                          // Extract ref number from egData
                          const refNo = caseItem.egData?.Ref || 
                                       caseItem.egData?.SWD_Ref || 
                                       "—";

                          const getData = (key: string) => {
                            const egVal = caseItem.egData?.[key];
                            if (egVal !== undefined && egVal !== null && egVal !== "") return egVal;
                            return "—";
                          };

                          const statusColors = {
                            pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
                            approved: "bg-green-100 text-green-800 border-green-300",
                            rejected: "bg-red-100 text-red-800 border-red-300",
                            under_review: "bg-blue-100 text-blue-800 border-blue-300",
                          };

                          return (
                            <TableRow
                              key={caseItem.id}
                              className={cn(
                                "cursor-pointer transition-colors",
                                isSelected && "bg-primary/5",
                              )}
                              onClick={() => handleSelectProduct(caseItem.id)}
                            >
                              <TableCell
                                className="sticky left-0 bg-background z-10"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() =>
                                    handleSelectProduct(caseItem.id)
                                  }
                                />
                              </TableCell>
                              {/* Priority columns */}
                              <TableCell className="font-medium font-mono whitespace-nowrap px-4 bg-primary/5">
                                {caseItem.caseNumber}
                              </TableCell>
                              <TableCell className="whitespace-nowrap px-4 bg-primary/5">
                                <Badge
                                  variant="outline"
                                  className={statusColors[caseItem.status]}
                                >
                                  {caseItem.status.replace('_', ' ').toUpperCase()}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium whitespace-nowrap px-4 bg-primary/5">
                                {productName}
                              </TableCell>
                              <TableCell className="font-mono whitespace-nowrap px-4 bg-primary/5">
                                {refNo}
                              </TableCell>
                              {/* Other EG data columns */}
                              {[
                                "App_No",
                                "Tranche",
                                "EB_RM",
                                "NO",
                                "NO_R",
                                "Staff",
                                "D_ReqF_SWD",
                                "D_PlnT_SWD",
                                "D_EGF_Out",
                                "D_EGF_Dead",
                                "SWD_Off_N",
                                "SWD_Off_P",
                                "SWD_Off_I",
                                "App_Type",
                                "App_Cat",
                                "Rem_RA",
                                "Recd_EGF",
                                "Recd_PAF",
                                "Recd_Quo",
                                "Recd_Cat",
                                "Ret_Rept",
                                "MRef",
                                "Req_I_SWD_YN",
                                "D_ReqT_SWD",
                                "Req_RepSWD_YN",
                                "D_RetF_SWD",
                                "Rem_Req",
                                "D_WkRep",
                                "WkRep_Status",
                                "WkRep_Rem",
                                "RecdCurrWk_YN",
                                "EGF_Ready_YN",
                                "EGF_To_EG_YN",
                                "D_EGF_T_EG",
                                "EG_Reply_YN",
                                "D_EG_Reply",
                                "Rem_EG",
                                "EGF_To_SWD_YN",
                                "D_EGF_ASWD",
                                "FUF_Comp_YN",
                                "DatEntry",
                              ].map((col) => (
                                <TableCell
                                  key={col}
                                  className="whitespace-nowrap px-4"
                                >
                                  {getData(col)}
                                </TableCell>
                              ))}
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No pending cases</h3>
                  <p className="text-muted-foreground max-w-md">
                    There are no cases pending review. Upload products in Stage 1 to create new cases.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

              {selectedProducts.length > 0 && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">
                        {selectedProducts.length} product(s) selected
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Choose an action to generate AI justification
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={handleRetrieveSimilarCases}
                        disabled={
                          isLoadingSimilarCases || isLoadingSimilarMatches
                        }
                        className="gap-2 bg-transparent"
                      >
                        {isLoadingSimilarCases || isLoadingSimilarMatches ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <History className="w-4 h-4" />
                        )}
                        Similar Cases
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleGenerateJustification("rejected")}
                        disabled={isGeneratingJustification}
                        className="gap-2 border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </Button>
                      <Button
                        onClick={() => handleGenerateJustification("approved")}
                        disabled={isGeneratingJustification}
                        className="gap-2 bg-success hover:bg-success/90 text-success-foreground"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Approve
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            {/* </CardContent>
          </Card> */}

          {isLoadingSimilarCases && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <div>
                    <CardTitle className="text-base">
                      Loading Similar Cases
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Analyzing dataset for similar cases...
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary animate-pulse" />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Finding matching cases...
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {similarCaseAnalysis?.cases?.length && !isLoadingSimilarCases && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-secondary-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        Similar Cases Analysis
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {similarCaseAnalysis.cases?.length} similar cases found
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSimilarCaseAnalysis(null)}
                    className="text-muted-foreground"
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Statistics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-success" />
                      <span className="text-sm font-medium text-success">
                        Approval Rate
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-success mb-2">
                      {similarCaseAnalysis.approvalRate}%
                    </div>
                    <Progress
                      value={similarCaseAnalysis.approvalRate}
                      className="h-2 bg-success/20"
                    />
                  </div>
                  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="w-4 h-4 text-destructive" />
                      <span className="text-sm font-medium text-destructive">
                        Rejection Rate
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-destructive mb-2">
                      {similarCaseAnalysis.rejectionRate}%
                    </div>
                    <Progress
                      value={similarCaseAnalysis.rejectionRate}
                      className="h-2 bg-destructive/20"
                    />
                  </div>
                </div>

                {/* Common Factors */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-success">
                      <CheckCircle2 className="w-4 h-4" />
                      Common Approval Factors
                    </div>
                    <ul className="space-y-1.5">
                      {similarCaseAnalysis.commonApprovalFactors.map(
                        (factor, idx) => (
                          <li
                            key={idx}
                            className="text-xs text-muted-foreground flex items-start gap-2 p-2 rounded bg-success/5 border border-success/10"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-success mt-1 shrink-0" />
                            {factor}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                      <XCircle className="w-4 h-4" />
                      Common Rejection Factors
                    </div>
                    <ul className="space-y-1.5">
                      {similarCaseAnalysis.commonRejectionFactors.map(
                        (factor, idx) => (
                          <li
                            key={idx}
                            className="text-xs text-muted-foreground flex items-start gap-2 p-2 rounded bg-destructive/5 border border-destructive/10"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-1 shrink-0" />
                            {factor}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                </div>

                {/* Individual Cases */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-foreground">
                    Individual Cases
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {similarCaseAnalysis.cases.map((caseItem) => (
                      <div
                        key={caseItem.id}
                        className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {caseItem.productName}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleCopy(caseItem.id, caseItem.justification)}
                              title="Copy Justification"
                            >
                              {copiedId === caseItem.id ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {Math.round(caseItem.similarity * 100)}% match
                            </span>
                            <Badge
                              variant={
                                caseItem.decision === "approved"
                                  ? "default"
                                  : "destructive"
                              }
                              className={cn(
                                "text-xs",
                                caseItem.decision === "approved" &&
                                  "bg-success text-success-foreground",
                              )}
                            >
                              {caseItem.decision}
                            </Badge>
                            {caseItem.approvalStatus && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-blue-50 border-blue-200 text-blue-700"
                              >
                                Q12a: {caseItem.approvalStatus}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {caseItem.justification}
                        </p>
                        <Badge variant="outline" className="text-xs mt-2">
                          {caseItem.category}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* AI Justification Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">AI Justification</CardTitle>
                  <CardDescription className="text-xs">
                    Generated reasoning for decision
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isGeneratingJustification ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Generating justification...
                  </p>
                </div>
              ) : generatedJustification ? (
                <div className="space-y-4">
                  <div
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg",
                      pendingDecision === "approved"
                        ? "bg-success/10 text-success"
                        : "bg-destructive/10 text-destructive",
                    )}
                  >
                    {pendingDecision === "approved" ? (
                      <ThumbsUp className="w-4 h-4" />
                    ) : (
                      <ThumbsDown className="w-4 h-4" />
                    )}
                    <span className="font-medium text-sm capitalize">
                      {pendingDecision} Decision
                    </span>
                  </div>

                  <Textarea
                    value={generatedJustification}
                    onChange={(e) => setGeneratedJustification(e.target.value)}
                    rows={8}
                    className="text-sm"
                  />

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleGenerateJustification(pendingDecision!)
                      }
                      className="gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Regenerate
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleConfirmDecision}
                      className={cn(
                        "flex-1 gap-1",
                        pendingDecision === "approved"
                          ? "bg-success hover:bg-success/90 text-success-foreground"
                          : "bg-destructive hover:bg-destructive/90",
                      )}
                    >
                      Confirm{" "}
                      {pendingDecision === "approved"
                        ? "Approval"
                        : "Rejection"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-8 h-8 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">
                    Select products and choose an action
                  </p>
                  <p className="text-xs mt-1">
                    AI will generate a justification
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Similar Justifications Quick View */}
          {similarJustifications.length > 0 && !similarCaseAnalysis && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Similar Decisions</CardTitle>
                <CardDescription className="text-xs">
                  Based on product category and attributes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {similarJustifications.map((similar) => (
                  <div
                    key={similar.id}
                    className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {similar.productName}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() =>
                            handleCopy(similar.id, similar.justification)
                          }
                          title="Copy Justification"
                        >
                          {copiedId === similar.id ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                      <Badge
                        variant={
                          similar.decision === "approved"
                            ? "default"
                            : "destructive"
                        }
                        className={cn(
                          "text-xs",
                          similar.decision === "approved" &&
                            "bg-success text-success-foreground",
                        )}
                      >
                        {similar.decision}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {similar.justification}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {similar.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(similar.similarity * 100)}% match
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <Button
          variant="outline"
          onClick={onBack}
          className="gap-2 bg-transparent"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Preview
        </Button>
        <Button
          onClick={onComplete}
          disabled={pendingProducts.length > 0}
          size="lg"
          className="gap-2"
        >
          Complete Workflow
          <CheckCircle2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
