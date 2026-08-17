import cv2


image = cv2.imread('Backend/box_scores/boxscore_excel.jpg') #Loads the image
clone = image.copy() #this clones the original image, allowing a reset of the cropping stage


ref_point = [] # Global points for cropping table size
dragging = False

print('Press c to crop the selected table size')

def shape_selection(event, x, y, flags, param):
  global ref_point
  global dragging
  global image
  global clone

  if event == cv2.EVENT_LBUTTONDOWN:    # when the user clicks their mouse button
    ref_point = [(x, y)]
    dragging = True

  elif event == cv2.EVENT_MOUSEMOVE and dragging:    # when the user is moving their mouse held down
    image = clone.copy()  # fresh copy of the original image to draw on

    if len(ref_point) == 1:    # if the user has clicked their mouse button, but not released it yet
        cv2.rectangle(
            image,            # Image to draw on
            ref_point[0],     # starting point of the rectangle
            (x, y),           # current mouse position as the ending point of the rectangle
            (0, 255, 0),      # rectangles color
            2)                # line thickness
    
    cv2.imshow('image', image)      # makes the rectangle visible


  elif event == cv2.EVENT_LBUTTONUP:    # when the user releases their mouse button
    dragging = False

    if len(ref_point) == 1:    # if the user has clicked their mouse button, but not released it yet

        ref_point.append((x, y))

        image = clone.copy()  # fresh copy of the original image to draw on

        cv2.rectangle(
        image,            # Image to draw on
        ref_point[0],     # starting point of the rectangle
        (x, y),           # current mouse position as the ending point of the rectangle
        (0, 255, 0),      # rectangles color
        2)                # line thickness                # line thickness

    cv2.imshow('image', image)      # makes the rectangle visible   


cv2.namedWindow('image')    
cv2.setMouseCallback('image', shape_selection)  # calls shape_selection whenever the user clicks on the image

while True:                         # whilst the application is running, the user can select a new table size
  cv2.imshow('image', image)

  key = cv2.waitKey(1) & 0xFF

  if key == ord("c"):               # Press 'c' to crop selected table size
    if len(ref_point) == 2:             # if the user has selected a table size
      break
    else:                               # if the user hasn't selected a table size
      print("Please select a table size")

if len(ref_point) == 2:                 # if the user hasn't selected a table size the length will be 0
  cropped_table = clone[
    ref_point[0][1] : ref_point[1][1],  # x1:y1,
    ref_point[0][0] : ref_point[1][0]]  # x2:y2
  
  cv2.imshow('Table Size', cropped_table)   # shows the cropped table

  print('Press any key to close')
  
  cv2.waitKey(0)                            # waiting for the user to press a key before closing

cv2.destroyAllWindows()     # closes the window