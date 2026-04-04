import { PromotionTable } from "@/components/Tables/PromotionTable"
export default function SalePage() {

   return (
       <main className="px-20 pt-10 pb-25">
           <p className="text-purple text-3xl font-medium">Danh sách khuyến mãi</p>

           <PromotionTable></PromotionTable>
       </main>
   )
}
