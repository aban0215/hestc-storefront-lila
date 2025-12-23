import { listCollections } from "@lib/data/collections"
import { getFooterSetting } from "../../../../lib/strapi/home-data"
import {getSelectedLocale} from "@lib/data/locales";
import {getRegion} from "@lib/data/regions";
import Footer from "@modules/layout/templates/footer/Footer";




export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  // const { countryCode } = params

  const localecode = (await getSelectedLocale()) || 'en-US'

  // const region = await getRegion(countryCode)

  const footerData = await getFooterSetting(localecode)

  if (!footerData) return null



  const { collections } = await listCollections({
    fields: "id, handle, title",
  })

  if (!collections) {
    return null
  }

  return (
      <>
          {footerData && (
              <Footer
                  data={footerData}
                  // regions={region}
                  // locales={localecode}
              />
          )}
      </>
  )
}