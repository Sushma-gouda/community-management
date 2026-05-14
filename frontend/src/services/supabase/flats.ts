import { supabase } from "./client";

export async function getFlats() {
    const { data, error } = await supabase
        .from("flats")
        .select("*")
        .order("id", { ascending: false });

    if (error) throw error;

    return data;
}

export async function addFlat(
    blockName: string,
    flatNumber: string,
    ownerName: string
) {
    const { data, error } = await supabase
        .from("flats")
        .insert({
            block_name: blockName,
            flat_number: flatNumber,
            owner_name: ownerName,
        });

    if (error) throw error;

    return data;
}

export async function deleteFlat(id: number) {
    const { error } = await supabase
        .from("flats")
        .delete()
        .eq("id", id);

    if (error) throw error;
}