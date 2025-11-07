import React from 'react'

interface StatusBadgeProps {
    status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({status}) => {

    const getStatusConfig =(status: string) =>{

        const config = {
            connected: { color: 'green', text: 'Connected' },
            complete: { color: 'green', text: 'Complete' },
            invited: { color: 'yellow', text: 'Invited' },
            'offer-sent': { color: 'blue', text: 'Offer Sent' },
            'request-sent': { color: 'blue', text: 'Request Sent' },
            'credential-received': { color: 'green', text: 'Received' },
            done: { color: 'green', text: 'Done' },
            verified: { color: 'green', text: 'Verified' },
            error: { color: 'red', text: 'Error' },

        }
        return config[status as keyof typeof config] || {color: 'gray', text: status};
    }

    const {color,text} = getStatusConfig(status);


    return (

        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800`}>
            {text}
        </span>


  )
}

export default StatusBadge