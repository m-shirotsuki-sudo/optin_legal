export type VariableFieldType = "text" | "textarea" | "tel" | "date" | "number";

export interface VariableField {
  key: string;
  label: string;
  type: VariableFieldType;
  required?: boolean;
  hint?: string;
  placeholder?: string;
  pattern?: string;
}

export interface VariableFieldGroup {
  group: string;
  description?: string;
  fields: VariableField[];
}

export type VariableFieldSpec = VariableField | VariableFieldGroup;

export interface SellerInfo {
  address: string;
  corp_name: string;
  representative: string;
  tel: string;
}

export interface Company {
  id: string;
  code: string;
  name: string;
  seller_info: SellerInfo;
  created_at: string;
}

export interface Plan {
  id: string;
  company_id: string;
  name: string;
  version: string;
  is_active: boolean;
  template_html: string;
  constants: Record<string, unknown>;
  variable_fields: VariableFieldSpec[];
  original_docx_path: string | null;
  original_checksum: { keyphrases: string[]; verified_at: string } | null;
  created_at: string;
}

export interface Contract {
  id: string;
  plan_id: string;
  created_by: string | null;
  input_values: Record<string, string>;
  pdf_path: string | null;
  created_at: string;
}
