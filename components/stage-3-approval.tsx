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
import type {
  Product,
  SimilarJustification,
  SimilarCaseAnalysis,
} from "@/lib/types";

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

  console.log("Products in Stage3Approval:", products);

  const [searchQuery, setSearchQuery] = useState("");
  const [generatedJustification, setGeneratedJustification] = useState("");
  const [pendingDecision, setPendingDecision] = useState<
    "approved" | "rejected" | null
  >(null);
  const [similarCaseAnalysis, setSimilarCaseAnalysis] =
    useState<SimilarCaseAnalysis | null>(null);
  const [isLoadingSimilarCases, setIsLoadingSimilarCases] = useState(false);

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
      // Use the first selected product's EG data as the reference
      const firstProduct = selectedProductObjects[0];
      if (!firstProduct) return;

      const egData = firstProduct.egData?.data || {};
      const applicationData = firstProduct.applicationData?.data || {};
      const appCat = applicationData.PA_Cat || "";
      const description =
        firstProduct.catalogueData?.data?.products[0]?.description || "";

      // Call the similar matches API
      await fetchSimilarMatches({
        item: {
          PA_Cat: appCat,
          desc: description,
        },
        srcField: "PA_Cat",
        datasetName: "Justification Creation",
        datasetType: "justification-testing",
        dstField: "RefL_Cat",
        descriptionField: "desc",
      });

      console.log("matches", matches);

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
    selectedProductObjects,
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

        // Process each selected product
        for (const productId of selectedProducts) {
          const product = products.find((p) => p.id === productId);
          if (!product) continue;

          // Fetch similar matches for this product
          const applicationData = product.applicationData?.data || {};
          const appCat = applicationData.PA_Cat || "";
          const description =
            product.catalogueData?.data?.products[0]?.description || "";

          try {
            await fetchSimilarMatches({
              item: {
                PA_Cat: appCat,
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
              `Failed to fetch similar matches for ${product.name}`,
              err,
            );
          }

          // Call justification API for this product
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

          const currentCase = product.catalogueData?.data?.products;
          const appData = product.applicationData?.data || {};

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
              const justification = await generateJustification(
                [product],
                decision,
              );
              justifications.push(justification);
            }
          } catch (error) {
            console.error(
              `Error generating justification for ${product.name}:`,
              error,
            );
            const justification = await generateJustification(
              [product],
              decision,
            );
            justifications.push(justification);
          }
        }

        // Use justification from first product for display
        setGeneratedJustification(justifications[0] || "");
      } finally {
        setIsGeneratingJustification(false);
      }
    },
    [
      selectedProducts,
      products,
      fetchSimilarMatches,
      matches,
      setIsGeneratingJustification,
      setSimilarJustifications,
    ],
  );

  const handleConfirmDecision = useCallback(async () => {
    if (!pendingDecision) return;

    try {
      setIsGeneratingJustification(true);

      // Prepare similar matches data (filter by similarity > 0.7)
      // const similarMatches =
      //   similarCaseAnalysis?.cases
      //     .filter((c) => c.similarity > 0.5)
      //     .map((c) => ({
      //       Justify: c.justification,
      //       Prod_Name: c.productName,
      //       Status: c.approvalStatus,
      //       Model_Code: c.metadata?.Model_Code || "",
      //       Desc: c.metadata?.RefL_Des || "",
      //     })) || [];

      // // Prepare current case data from first selected product
      // const firstProduct = selectedProductObjects[0];
      // const currentCase = firstProduct.catalogueData?.data?.products;

      // // Prepare application data
      // const applicationData = firstProduct.applicationData?.data || {};

      // // Call the justification suggestion API via Next.js route
      // const response = await fetch("/api/suggest/justification", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     similar_matches: similarMatches,
      //     current_case: currentCase,
      //     application_data: applicationData,
      //   }),
      // });

      // if (response.ok) {
      //   const result = await response.json();
      //   console.log("Justification suggestion:", result);
      //   // Optionally update the generated justification with API response
      //   if (result?.data?.justification) {
      //     setGeneratedJustification(result.justification);
      //   }
      // } else {
      //   console.warn("Justification API call failed, proceeding with decision");
      // }
    } catch (error) {
      console.error("Error calling justification API:", error);
      // Continue with decision even if API fails
    } finally {
      setIsGeneratingJustification(false);

      // Update product statuses
      selectedProducts.forEach((id) => {
        updateProduct(id, { status: pendingDecision });
      });

      clearSelection();
      setGeneratedJustification("");
      setSimilarJustifications([]);
      setPendingDecision(null);
      setSimilarCaseAnalysis(null);
    }
  }, [
    pendingDecision,
    selectedProducts,
    selectedProductObjects,
    updateProduct,
    clearSelection,
    setSimilarJustifications,
    similarCaseAnalysis,
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
        {/* Product Selection Table */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <CardTitle className="text-lg">Pending Products</CardTitle>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredProducts.length > 0 ? (
                <div className="rounded-lg border overflow-hidden overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-12 sticky left-0 bg-muted/50 z-10">
                          <Checkbox
                            checked={
                              selectedProducts.length ===
                                filteredProducts.length &&
                              filteredProducts.length > 0
                            }
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        {[
                          "App_PNam_Mod",
                          "SWD_Ref",
                          "Ref",
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
                      {filteredProducts.map((product) => {
                        const isSelected = selectedProducts.includes(
                          product.id,
                        );
                        const egFields = [
                          "App_PNam_Mod",
                          "SWD_Ref",
                          "Ref",
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
                        ];
                        const getData = (key: string) => {
                          const egVal = product.egData?.data?.[key];
                          if (egVal !== undefined) return egVal;
                          return "—";
                        };

                        return (
                          <TableRow
                            key={product.id}
                            className={cn(
                              "cursor-pointer transition-colors",
                              isSelected && "bg-primary/5",
                            )}
                            onClick={() => handleSelectProduct(product.id)}
                          >
                            <TableCell
                              className="sticky left-0 bg-background z-10"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() =>
                                  handleSelectProduct(product.id)
                                }
                              />
                            </TableCell>
                            {egFields.map((col) => (
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
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No pending products</p>
                  <p className="text-sm">All products have been processed</p>
                </div>
              )}

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
            </CardContent>
          </Card>

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
                          <span className="font-medium text-sm">
                            {caseItem.productName}
                          </span>
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
                      <span className="font-medium text-sm">
                        {similar.productName}
                      </span>
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
