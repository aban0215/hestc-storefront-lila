import { listCollections } from "@lib/data/collections"
import {getSelectedLocale} from "@lib/data/locales";
import Footer from "@modules/layout/templates/footer/Footer";
import {getFooterSetting} from "../../../../lib/strapi/home-data";



export default async function Home() {

  const localecode = (await getSelectedLocale()) || 'en-US'

  const footData = await getFooterSetting(localecode)


  const { collections } = await listCollections({
    fields: "id, handle, title",
  })

  if (!collections) {
    return null
  }

  return (
      <>
        {footData && (
            <Footer
                data={footData}
            />
        )}
      </>
  )
}