import { Link, useNavigate, useParams } from 'react-router-dom';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchEvent, queryClient, updateEvent } from '../../util/http.js';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function EditEvent() {
  const navigate = useNavigate();
  const params = useParams();

  const {data, isPending, isError, error} = useQuery({
    queryKey: ['events', params.id],
    queryFn: ({signal}) => fetchEvent({signal, id: params.id}),

  });

  const {
    mutate,
    // isPending: isPendingDeletion,
    // isError: isErrorDeleting,
    // error: deleteError,
  } = useMutation({
    mutationFn: updateEvent,
    onMutate: async (data)=>{
      const newEvent = data.event;
      await queryClient.cancelQueries({queryKey: ['events', params.id]});
      const previousEvent = await queryClient.getQueryData({queryKey: ['events', params.id]});
      queryClient.setQueryData(['events', params.id], newEvent );

      return{previousEvent}
    },
    onError:(error, data, context)=> {
      queryClient.setQueryData(['events', params.id], context.previousEvent );
    }
  });



  function handleSubmit(formData) {
    mutate({id:params.id, event:formData})
  }

  function handleClose() {
    navigate('../');
  }

  let content;

  if(isPending){
    content = (
      <div className='center'>
        <LoadingIndicator />
      </div>
    )
  }

  if (isError) {
    content = (
      <>
        <div id="event-details-content" className="center">
          <ErrorBlock
            title="Failed to load event"
            message={
              error.info?.message ||
              'Failed to fetch event data, please try again later.'
            }
          />
        </div>
        <div className='form-actions'>
            <Link to="../" className='action'>
            Okay
            </Link>
        </div>
      </>
    );
  }

  if(data){
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        <Link to="../" className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button">
          Update
        </button>
      </EventForm>
    )
  }


  return (
    <Modal onClose={handleClose}>
      {content}
    </Modal>
  );
}
