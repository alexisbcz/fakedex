
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "abilities": {
                  Row: {
                    "description": string | null,"dex_id": string,"id": string,"name": string
                  }
                  Insert: {
                    "description"?: string | null,"dex_id": string,"id"?: string,"name": string
                  }
                  Update: {
                    "description"?: string | null,"dex_id"?: string,"id"?: string,"name"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "abilities_dex_id_fkey"
      columns: ["dex_id"]
isOneToOne: false
      referencedRelation: "dexes"
      referencedColumns: ["id"]
    }
                  ]
                },"categories": {
                  Row: {
                    "dex_id": string,"id": string,"name": string,"position": number
                  }
                  Insert: {
                    "dex_id": string,"id"?: string,"name": string,"position"?: number
                  }
                  Update: {
                    "dex_id"?: string,"id"?: string,"name"?: string,"position"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "categories_dex_id_fkey"
      columns: ["dex_id"]
isOneToOne: false
      referencedRelation: "dexes"
      referencedColumns: ["id"]
    }
                  ]
                },"creature_abilities": {
                  Row: {
                    "ability_id": string,"creature_id": string,"dex_id": string,"is_hidden": boolean
                  }
                  Insert: {
                    "ability_id": string,"creature_id": string,"dex_id": string,"is_hidden"?: boolean
                  }
                  Update: {
                    "ability_id"?: string,"creature_id"?: string,"dex_id"?: string,"is_hidden"?: boolean
                  }
                  Relationships: [
                    {
      foreignKeyName: "creature_abilities_ability_id_dex_id_fkey"
      columns: ["ability_id","dex_id"]
isOneToOne: false
      referencedRelation: "abilities"
      referencedColumns: ["id","dex_id"]
    },{
      foreignKeyName: "creature_abilities_creature_id_dex_id_fkey"
      columns: ["creature_id","dex_id"]
isOneToOne: false
      referencedRelation: "creatures"
      referencedColumns: ["id","dex_id"]
    },{
      foreignKeyName: "creature_abilities_dex_id_fkey"
      columns: ["dex_id"]
isOneToOne: false
      referencedRelation: "dexes"
      referencedColumns: ["id"]
    }
                  ]
                },"creature_moves": {
                  Row: {
                    "creature_id": string,"dex_id": string,"id": string,"level": number | null,"method": Database["public"]['Enums']["learn_method"],"move_id": string
                  }
                  Insert: {
                    "creature_id": string,"dex_id": string,"id"?: string,"level"?: number | null,"method"?: Database["public"]['Enums']["learn_method"],"move_id": string
                  }
                  Update: {
                    "creature_id"?: string,"dex_id"?: string,"id"?: string,"level"?: number | null,"method"?: Database["public"]['Enums']["learn_method"],"move_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "creature_moves_creature_id_dex_id_fkey"
      columns: ["creature_id","dex_id"]
isOneToOne: false
      referencedRelation: "creatures"
      referencedColumns: ["id","dex_id"]
    },{
      foreignKeyName: "creature_moves_dex_id_fkey"
      columns: ["dex_id"]
isOneToOne: false
      referencedRelation: "dexes"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "creature_moves_move_id_dex_id_fkey"
      columns: ["move_id","dex_id"]
isOneToOne: false
      referencedRelation: "moves"
      referencedColumns: ["id","dex_id"]
    }
                  ]
                },"creatures": {
                  Row: {
                    "attack": number,"category_id": string | null,"created_at": string,"defense": number,"description": string | null,"dex_id": string,"height_m": number | null,"hp": number,"id": string,"image_path": string | null,"name": string,"number": number,"primary_type_id": string | null,"secondary_type_id": string | null,"sp_attack": number,"sp_defense": number,"species": string | null,"speed": number,"updated_at": string,"weight_kg": number | null
                  }
                  Insert: {
                    "attack"?: number,"category_id"?: string | null,"created_at"?: string,"defense"?: number,"description"?: string | null,"dex_id": string,"height_m"?: number | null,"hp"?: number,"id"?: string,"image_path"?: string | null,"name": string,"number": number,"primary_type_id"?: string | null,"secondary_type_id"?: string | null,"sp_attack"?: number,"sp_defense"?: number,"species"?: string | null,"speed"?: number,"updated_at"?: string,"weight_kg"?: number | null
                  }
                  Update: {
                    "attack"?: number,"category_id"?: string | null,"created_at"?: string,"defense"?: number,"description"?: string | null,"dex_id"?: string,"height_m"?: number | null,"hp"?: number,"id"?: string,"image_path"?: string | null,"name"?: string,"number"?: number,"primary_type_id"?: string | null,"secondary_type_id"?: string | null,"sp_attack"?: number,"sp_defense"?: number,"species"?: string | null,"speed"?: number,"updated_at"?: string,"weight_kg"?: number | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "creatures_category_id_dex_id_fkey"
      columns: ["category_id","dex_id"]
isOneToOne: false
      referencedRelation: "categories"
      referencedColumns: ["id","dex_id"]
    },{
      foreignKeyName: "creatures_dex_id_fkey"
      columns: ["dex_id"]
isOneToOne: false
      referencedRelation: "dexes"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "creatures_primary_type_id_dex_id_fkey"
      columns: ["primary_type_id","dex_id"]
isOneToOne: false
      referencedRelation: "types"
      referencedColumns: ["id","dex_id"]
    },{
      foreignKeyName: "creatures_secondary_type_id_dex_id_fkey"
      columns: ["secondary_type_id","dex_id"]
isOneToOne: false
      referencedRelation: "types"
      referencedColumns: ["id","dex_id"]
    }
                  ]
                },"dexes": {
                  Row: {
                    "created_at": string,"description": string | null,"id": string,"is_public": boolean,"name": string,"owner_id": string,"updated_at": string
                  }
                  Insert: {
                    "created_at"?: string,"description"?: string | null,"id"?: string,"is_public"?: boolean,"name": string,"owner_id"?: string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"description"?: string | null,"id"?: string,"is_public"?: boolean,"name"?: string,"owner_id"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "dexes_owner_id_fkey"
      columns: ["owner_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"evolutions": {
                  Row: {
                    "condition": string | null,"dex_id": string,"from_creature_id": string,"id": string,"min_level": number | null,"to_creature_id": string,"trigger": Database["public"]['Enums']["evolution_trigger"]
                  }
                  Insert: {
                    "condition"?: string | null,"dex_id": string,"from_creature_id": string,"id"?: string,"min_level"?: number | null,"to_creature_id": string,"trigger"?: Database["public"]['Enums']["evolution_trigger"]
                  }
                  Update: {
                    "condition"?: string | null,"dex_id"?: string,"from_creature_id"?: string,"id"?: string,"min_level"?: number | null,"to_creature_id"?: string,"trigger"?: Database["public"]['Enums']["evolution_trigger"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "evolutions_dex_id_fkey"
      columns: ["dex_id"]
isOneToOne: false
      referencedRelation: "dexes"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "evolutions_from_creature_id_dex_id_fkey"
      columns: ["from_creature_id","dex_id"]
isOneToOne: false
      referencedRelation: "creatures"
      referencedColumns: ["id","dex_id"]
    },{
      foreignKeyName: "evolutions_to_creature_id_dex_id_fkey"
      columns: ["to_creature_id","dex_id"]
isOneToOne: false
      referencedRelation: "creatures"
      referencedColumns: ["id","dex_id"]
    }
                  ]
                },"moves": {
                  Row: {
                    "accuracy": number | null,"damage_class": Database["public"]['Enums']["damage_class"],"description": string | null,"dex_id": string,"id": string,"name": string,"power": number | null,"pp": number,"type_id": string | null
                  }
                  Insert: {
                    "accuracy"?: number | null,"damage_class"?: Database["public"]['Enums']["damage_class"],"description"?: string | null,"dex_id": string,"id"?: string,"name": string,"power"?: number | null,"pp"?: number,"type_id"?: string | null
                  }
                  Update: {
                    "accuracy"?: number | null,"damage_class"?: Database["public"]['Enums']["damage_class"],"description"?: string | null,"dex_id"?: string,"id"?: string,"name"?: string,"power"?: number | null,"pp"?: number,"type_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "moves_dex_id_fkey"
      columns: ["dex_id"]
isOneToOne: false
      referencedRelation: "dexes"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "moves_type_id_dex_id_fkey"
      columns: ["type_id","dex_id"]
isOneToOne: false
      referencedRelation: "types"
      referencedColumns: ["id","dex_id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "avatar_url": string | null,"created_at": string,"display_name": string | null,"id": string
                  }
                  Insert: {
                    "avatar_url"?: string | null,"created_at"?: string,"display_name"?: string | null,"id": string
                  }
                  Update: {
                    "avatar_url"?: string | null,"created_at"?: string,"display_name"?: string | null,"id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"type_matchups": {
                  Row: {
                    "attacker_type_id": string,"defender_type_id": string,"dex_id": string,"multiplier": number
                  }
                  Insert: {
                    "attacker_type_id": string,"defender_type_id": string,"dex_id": string,"multiplier": number
                  }
                  Update: {
                    "attacker_type_id"?: string,"defender_type_id"?: string,"dex_id"?: string,"multiplier"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "type_matchups_attacker_type_id_dex_id_fkey"
      columns: ["attacker_type_id","dex_id"]
isOneToOne: false
      referencedRelation: "types"
      referencedColumns: ["id","dex_id"]
    },{
      foreignKeyName: "type_matchups_defender_type_id_dex_id_fkey"
      columns: ["defender_type_id","dex_id"]
isOneToOne: false
      referencedRelation: "types"
      referencedColumns: ["id","dex_id"]
    },{
      foreignKeyName: "type_matchups_dex_id_fkey"
      columns: ["dex_id"]
isOneToOne: false
      referencedRelation: "dexes"
      referencedColumns: ["id"]
    }
                  ]
                },"types": {
                  Row: {
                    "color": string,"dex_id": string,"id": string,"name": string
                  }
                  Insert: {
                    "color"?: string,"dex_id": string,"id"?: string,"name": string
                  }
                  Update: {
                    "color"?: string,"dex_id"?: string,"id"?: string,"name"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "types_dex_id_fkey"
      columns: ["dex_id"]
isOneToOne: false
      referencedRelation: "dexes"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "can_read_dex":
{ Args: { "p_dex_id": string }; Returns: boolean
                           },
"owns_dex":
{ Args: { "p_dex_id": string }; Returns: boolean
                           }
          }
          Enums: {
            "damage_class": "physical"|"special"|"status","evolution_trigger": "level"|"item"|"trade"|"friendship"|"other","learn_method": "level"|"machine"|"egg"|"tutor"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "damage_class": ["physical", "special", "status"],"evolution_trigger": ["level", "item", "trade", "friendship", "other"],"learn_method": ["level", "machine", "egg", "tutor"]
          }
        }
} as const
