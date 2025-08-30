import { SomethingWentWrong } from '@/components/common/SomethingWentWrong'
import { ScrollArea } from '@/components/ui/scroll-area'
import serverAxios from '@/lib/api/serverAxios'
import moment from 'moment'
import React from 'react'

const page = async () => {
  try {
    const { data } = await serverAxios.get("/api/v1/admin/track-records", {
      withCredentials: true
    })
    
    if (!data.success) {
      throw new Error(data.message)
    }

    return (
      <ResponsiveTable data={data.result} />
    )
  } catch (error) {
    return (
      <SomethingWentWrong />
    )
  }

}
const ResponsiveTable = ({ data }: { data: any[] }) => {



  return (
    <div className="w-full">
      <ScrollArea className="h-[600px] rounded-md border">
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full border border-gray-200 bg-transparent shadow-md rounded-lg overflow-hidden">
            <thead className="bg-stone-400">
              <tr>
                <th className="px-4 py-2 text-left text-gray-700">From</th>
                <th className="px-4 py-2 text-left text-gray-700">To</th>
                <th className="px-4 py-2 text-left text-gray-700">Opened</th>
                <th className="px-4 py-2 text-left text-gray-700">Opened Times</th>
                <th className="px-4 py-2 text-left text-gray-700">Last Opened</th>
                <th className="px-4 py-2 text-left text-gray-700">Status</th>

              </tr>
            </thead>
            <tbody className='text-gray-400'>
              {data.length === 0 ? <tr><td colSpan={5} className="text-center">No records found</td></tr>
                : data.map((domain,i:number) =>
                  domain.track_records.filter((d: any,) => d !== null).length === 0 ?
                    <tr key={domain.id+i}>
                      <td colSpan={5} className="text-center">No records found</td></tr> :
                    domain.track_records.map((record: any) => (
                      <tr key={record.id+i} className="border-t border-gray-400 hover:bg-stone-900">

                        <td className="px-4 py-2">{record?.from}</td>
                        <td className="px-4 py-2">{record?.to}</td>
                        <td className="px-4 py-2">{record?.opened ? "Yes" : "No"}</td>
                        <td className="px-4 py-2">{record?.opened_times}</td>
                        <td className="px-4 py-2">{record?.last_opened ? moment(record?.last_opened).format("YYYY-MM-DD hh:mm:ss A") : "Not Opened Yet"}</td>
                        <td className="px-4 py-2">
                          {Object.entries(record?.all_status).map(([status, time]) => (
                            <p key={status}><strong>{status}:</strong> {moment(time as string).format("YYYY-MM-DD hh:mm:ss A")}</p>
                          ))}
                        </td>
                      </tr>
                    ))
                )}
            </tbody>
          </table>
        </div>
        <div className="md:hidden space-y-4 text-gray-400 " >
          {data.length === 0 ? <div className="text-center">No records found</div> : data.map((domain) =>
            domain.track_records.filter((d: any) => d !== null).length === 0 ? <div className="text-center">No records found</div> : domain.track_records.map((record: any,i:number) => (
              <div key={record.id+i} className="border border-gray-200 p-4 rounded-lg shadow-md bg-black">

                <p><strong>From:</strong> {record?.from}</p>

                <p><strong>Status:</strong></p>
                <ul>
                  {Object.entries(record?.all_status).map(([status, time]) => (
                    <li key={status}><strong>{status}:</strong> {moment(time as string).format("YYYY-MM-DD hh:mm:ss A")}</li>
                  ))}
                </ul>
                <p><strong>Opened:</strong> {record?.opened ? "Yes" : "No"}</p>
                <p><strong>Opened Times:</strong> {record?.opened_times}</p>
                <p><strong>Last Opened:</strong> {record?.last_opened ? moment(record?.last_opened).format("YYYY-MM-DD hh:mm:ss A") : "Not Opened Yet"}</p>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
export default page