export const CATEGORIES={motion:'#4C97FF',looks:'#9966FF',sound:'#CF63CF',events:'#FFBF00',control:'#FFAB19',sensing:'#5CB1D6',operators:'#59C059',variables:'#FF8C1A',myblocks:'#FF6680'};
export const CATEGORY_NAMES={motion:'การเคลื่อนไหว (Motion)',looks:'หน้าตา (Looks)',sound:'เสียง (Sound)',events:'เหตุการณ์ (Events)',control:'การควบคุม (Control)',sensing:'การรับรู้ (Sensing)',operators:'ตัวดำเนินการ (Operators)',variables:'ตัวแปรและรายการ (Variables & Lists)',myblocks:'บล็อกของฉัน (My Blocks)'};
export function blockHelp(text,category='control'){
  const t=String(text||'').trim();
  const n=t.toLowerCase();
  const guide=(meaning,use,tip='')=>({meaning,use,tip});
  if(n.startsWith('move ')) return guide('สั่งให้ Sprite เคลื่อนที่ไปข้างหน้าตามจำนวนก้าวที่กำหนด','ใช้ทำให้ตัวละครเดิน วิ่ง หรือเคลื่อนที่ตามทิศที่กำลังหันอยู่','ใส่ค่าติดลบเพื่อให้ตัวละครถอยหลังได้');
  if(n.startsWith('turn right')) return guide('หมุน Sprite ตามเข็มนาฬิกาตามจำนวนองศา','ใช้เปลี่ยนทิศทางก่อนเคลื่อนที่ หรือทำแอนิเมชันการหมุน');
  if(n.startsWith('turn left')) return guide('หมุน Sprite ทวนเข็มนาฬิกาตามจำนวนองศา','ใช้เปลี่ยนทิศทางไปทางซ้าย หรือหมุนกลับ');
  if(n.startsWith('point in direction')) return guide('กำหนดทิศที่ Sprite หันอยู่โดยตรง','ใช้ตั้งทิศเริ่มต้น เช่น 90 = ขวา, 0 = ขึ้น, -90 = ซ้าย, 180 = ลง');
  if(n.startsWith('point towards')) return guide('หัน Sprite ไปหาเป้าหมายที่เลือก','ใช้ให้ตัวละครหันตามเมาส์หรือตัวละครอื่น');
  if(n.startsWith('go to x:')) return guide('ย้าย Sprite ไปยังพิกัด X และ Y ทันที','ใช้กำหนดตำแหน่งเริ่มต้นหรือย้ายไปจุดที่แน่นอนบน Stage');
  if(n.startsWith('go to (')) return guide('ย้าย Sprite ไปยังเป้าหมายที่เลือกทันที','ใช้ย้ายไปตำแหน่งเมาส์หรือ Sprite อื่น');
  if(n.startsWith('glide ')) return guide('เลื่อน Sprite ไปยังพิกัดเป้าหมายอย่างนุ่มนวลในเวลาที่กำหนด','ใช้ทำการเคลื่อนที่แบบ Slide หรือ Animation ที่ไม่กระโดดตำแหน่งทันที');
  if(n.startsWith('change x by')) return guide('เพิ่มหรือลดค่าพิกัด X จากตำแหน่งปัจจุบัน','ใช้ขยับตัวละครไปทางขวาหรือซ้ายทีละระยะ');
  if(n.startsWith('set x to')) return guide('กำหนดค่าพิกัด X เป็นค่าที่ระบุ','ใช้ล็อกตำแหน่งแนวนอนของ Sprite');
  if(n.startsWith('change y by')) return guide('เพิ่มหรือลดค่าพิกัด Y จากตำแหน่งปัจจุบัน','ใช้ขยับตัวละครขึ้นหรือลงทีละระยะ');
  if(n.startsWith('set y to')) return guide('กำหนดค่าพิกัด Y เป็นค่าที่ระบุ','ใช้ล็อกตำแหน่งแนวตั้งของ Sprite');
  if(n==='if on edge, bounce') return guide('ตรวจว่าตัวละครชนขอบ Stage หรือไม่ แล้วสะท้อนทิศทางกลับ','ใช้ทำตัวละคร ลูกบอล หรือศัตรูให้เด้งกลับเมื่อถึงขอบจอ','มักใช้ร่วมกับ forever และ move เพื่อให้เห็นการเด้งอย่างต่อเนื่อง');
  if(n==='x position') return guide('รายงานค่าพิกัด X ปัจจุบันของ Sprite','ใช้เป็นข้อมูลในเงื่อนไข การคำนวณ หรือแสดงตำแหน่ง');
  if(n==='y position') return guide('รายงานค่าพิกัด Y ปัจจุบันของ Sprite','ใช้เป็นข้อมูลในเงื่อนไข การคำนวณ หรือแสดงตำแหน่ง');
  if(n==='direction') return guide('รายงานค่าทิศทางปัจจุบันของ Sprite','ใช้ตรวจสอบว่าตัวละครกำลังหันไปทางใด');
  if(n.startsWith('say ')) return guide('แสดงกล่องคำพูดเหนือ Sprite','ใช้สร้างบทสนทนา คำแนะนำ หรือข้อความตอบกลับผู้เล่น');
  if(n.startsWith('think ')) return guide('แสดงกล่องความคิดเหนือ Sprite','ใช้แสดงความคิดหรือข้อความที่ต่างจากคำพูด');
  if(n.startsWith('switch costume to')) return guide('เปลี่ยน Costume ของ Sprite เป็นชุดที่เลือก','ใช้เปลี่ยนท่าทาง รูปลักษณ์ หรือเฟรมของแอนิเมชัน');
  if(n==='next costume') return guide('เปลี่ยนไปยัง Costume ถัดไป','ใช้สร้างแอนิเมชันเดิน วิ่ง หรือเปลี่ยนสีหน้าแบบเป็นลำดับ');
  if(n.startsWith('switch backdrop to')) return guide('เปลี่ยนฉากหลังของ Stage เป็นฉากที่เลือก','ใช้เปลี่ยนสถานที่หรือฉากของเรื่องราวและเกม');
  if(n==='next backdrop') return guide('เปลี่ยนไปยังฉากหลังถัดไป','ใช้เล่าเรื่องเป็นฉากต่อเนื่องหรือเปลี่ยนด่าน');
  if(n.startsWith('change size by')) return guide('เพิ่มหรือลดขนาด Sprite จากขนาดปัจจุบัน','ใช้ทำให้ตัวละครโตขึ้นหรือเล็กลงแบบทีละขั้น');
  if(n.startsWith('set size to')) return guide('กำหนดขนาด Sprite เป็นเปอร์เซ็นต์ที่ระบุ','ใช้ตั้งขนาดเริ่มต้นหรือบังคับขนาดให้แน่นอน');
  if(n.startsWith('change color effect by')) return guide('เปลี่ยนค่าเอฟเฟกต์สีของ Sprite','ใช้สร้างเอฟเฟกต์เปลี่ยนสีแบบต่อเนื่อง');
  if(n.startsWith('set color effect to')) return guide('กำหนดค่าเอฟเฟกต์สีเป็นค่าที่ระบุ','ใช้ตั้งสีหรือรีเซ็ตค่าบางช่วงของโปรแกรม');
  if(n==='clear graphic effects') return guide('ล้างเอฟเฟกต์ภาพทั้งหมดของ Sprite','ใช้คืนรูปลักษณ์ให้กลับเป็นปกติ');
  if(n==='show') return guide('ทำให้ Sprite ปรากฏบน Stage','ใช้แสดงตัวละครที่เคยซ่อน');
  if(n==='hide') return guide('ซ่อน Sprite จาก Stage','ใช้ทำให้ตัวละครหรือวัตถุหายไปชั่วคราว');
  if(n.includes('front layer')||n.includes('forward (1) layers')) return guide('เปลี่ยนลำดับชั้นการแสดงผลของ Sprite','ใช้ควบคุมว่าวัตถุใดอยู่ด้านหน้าหรือด้านหลังเมื่อซ้อนกัน');
  if(n==='costume number') return guide('รายงานหมายเลข Costume ปัจจุบัน','ใช้ตรวจสอบว่าตัวละครกำลังใช้ชุดใด');
  if(n==='backdrop number') return guide('รายงานหมายเลขฉากหลังปัจจุบัน','ใช้ตรวจสอบฉากหรือสร้างเงื่อนไขตามฉาก');
  if(n==='size') return guide('รายงานขนาดปัจจุบันของ Sprite เป็นเปอร์เซ็นต์','ใช้ตรวจสอบหรือคำนวณตามขนาดของตัวละคร');
  if(n.startsWith('play sound')&&n.includes('until done')) return guide('เล่นเสียงและรอจนเสียงจบก่อนทำบล็อกถัดไป','ใช้เมื่อคำสั่งถัดไปต้องเริ่มหลังเสียงจบ');
  if(n.startsWith('start sound')) return guide('เริ่มเล่นเสียงแล้วทำบล็อกถัดไปทันที','ใช้ให้เสียงเล่นพร้อมกับการเคลื่อนไหวหรือคำสั่งอื่น');
  if(n==='stop all sounds') return guide('หยุดเสียงทั้งหมดที่กำลังเล่น','ใช้หยุดเพลงหรือเอฟเฟกต์เสียงเมื่อจบเกมหรือเปลี่ยนฉาก');
  if(n.startsWith('change volume by')) return guide('เพิ่มหรือลดระดับเสียงจากค่าปัจจุบัน','ใช้ทำ Fade in/Fade out หรือปรับความดังทีละขั้น');
  if(n.startsWith('set volume to')) return guide('กำหนดระดับเสียงเป็นเปอร์เซ็นต์','ใช้ตั้งความดังให้แน่นอน');
  if(n==='volume') return guide('รายงานระดับเสียงปัจจุบัน','ใช้ตรวจสอบหรือคำนวณค่าความดัง');
  if(n==='when green flag clicked') return guide('เริ่มสคริปต์เมื่อกด Green Flag','ใช้เป็นจุดเริ่มต้นหลักของโปรแกรมหรือเกม');
  if(n.startsWith('when (space) key pressed')) return guide('เริ่มสคริปต์เมื่อกดแป้นพิมพ์ที่เลือก','ใช้ควบคุมตัวละครด้วยคีย์บอร์ด');
  if(n==='when this sprite clicked') return guide('เริ่มสคริปต์เมื่อคลิก Sprite นี้','ใช้สร้างปุ่ม วัตถุโต้ตอบ หรือเกมคลิก');
  if(n.startsWith('when backdrop switches')) return guide('เริ่มสคริปต์เมื่อ Stage เปลี่ยนเป็นฉากที่กำหนด','ใช้สั่งเหตุการณ์ใหม่เมื่อเข้าสู่ฉากหรือด่านใหม่');
  if(n.startsWith('when (loudness)')) return guide('เริ่มสคริปต์เมื่อระดับเสียงจากไมโครโฟนมากกว่าค่าที่กำหนด','ใช้สร้างเกมหรือกิจกรรมที่ตอบสนองต่อเสียง');
  if(n.startsWith('when i receive')) return guide('เริ่มสคริปต์เมื่อได้รับข้อความ Broadcast','ใช้เชื่อมการทำงานระหว่าง Sprite หลายตัว');
  if(n.startsWith('broadcast ')&&n.includes('and wait')) return guide('ส่งข้อความ Broadcast และรอให้สคริปต์ผู้รับทำงานเสร็จ','ใช้จัดลำดับเหตุการณ์หลายตัวละครให้ต่อเนื่องกัน');
  if(n.startsWith('broadcast ')) return guide('ส่งข้อความ Broadcast ไปยัง Sprite และ Stage','ใช้สั่งให้หลายส่วนของโปรแกรมเริ่มทำงานพร้อมกัน');
  if(n.startsWith('wait (')) return guide('หยุดรอตามจำนวนวินาทีที่กำหนดแล้วจึงทำคำสั่งถัดไป','ใช้กำหนดจังหวะ เว้นเวลา หรือควบคุมความเร็วของแอนิเมชัน');
  if(n.startsWith('repeat (')) return guide('ทำคำสั่งที่อยู่ภายในซ้ำตามจำนวนครั้ง','ใช้ลดการเขียนบล็อกซ้ำ เช่น เดินและหมุน 4 ครั้งเพื่อสร้างสี่เหลี่ยม');
  if(n==='forever') return guide('ทำคำสั่งที่อยู่ภายในซ้ำตลอดเวลาจนกว่าจะหยุดโปรแกรม','ใช้กับการเคลื่อนไหวต่อเนื่อง การตรวจชน หรือ Game Loop');
  if(n.startsWith('if <> then else')) return guide('ตรวจเงื่อนไข ถ้าจริงทำชุดแรก ถ้าไม่จริงทำชุด Else','ใช้ตัดสินใจสองทาง เช่น ถ้าแตะศัตรูให้แพ้ ไม่เช่นนั้นให้เล่นต่อ');
  if(n.startsWith('if <> then')) return guide('ตรวจเงื่อนไข และทำคำสั่งด้านในเมื่อเงื่อนไขเป็นจริง','ใช้ตัดสินใจ เช่น ถ้าแตะเหรียญให้เพิ่มคะแนน');
  if(n.startsWith('wait until')) return guide('หยุดรอจนกว่าเงื่อนไขจะเป็นจริง','ใช้รอเหตุการณ์ก่อนทำขั้นตอนถัดไป');
  if(n.startsWith('repeat until')) return guide('วนคำสั่งซ้ำจนกว่าเงื่อนไขจะเป็นจริง','ใช้ทำงานต่อเนื่องจนถึงเป้าหมาย เช่น เดินจนแตะขอบ');
  if(n.startsWith('stop (')) return guide('หยุดสคริปต์หรือโปรแกรมตามตัวเลือก','ใช้จบเกม หยุดทุกคำสั่ง หรือหยุดเฉพาะสคริปต์');
  if(n.startsWith('touching color')) return guide('ตรวจว่า Sprite กำลังสัมผัสสีที่กำหนดหรือไม่','ใช้ตรวจชนกำแพง เส้นชัย หรือพื้นที่สีบนฉาก');
  if(n.startsWith('touching ')) return guide('ตรวจว่า Sprite กำลังสัมผัสเป้าหมายหรือไม่','ใช้ตรวจการชน เก็บไอเทม หรือสัมผัสเมาส์');
  if(n.startsWith('distance to')) return guide('รายงานระยะห่างจาก Sprite ถึงเป้าหมาย','ใช้สร้างเงื่อนไขตามระยะ เช่น ศัตรูไล่เมื่อเข้าใกล้');
  if(n.startsWith('ask ')) return guide('แสดงคำถามและรอให้ผู้เล่นพิมพ์คำตอบ','ใช้รับข้อมูลจากผู้เล่น เช่น ชื่อ หรือคำตอบคำถาม');
  if(n==='answer') return guide('รายงานคำตอบล่าสุดจากบล็อก Ask','ใช้ตรวจคำตอบหรือแสดงข้อความที่ผู้เล่นกรอก');
  if(n.startsWith('key ')) return guide('ตรวจว่าแป้นพิมพ์ที่เลือกกำลังถูกกดหรือไม่','ใช้สร้างการควบคุมใน Forever หรือ If');
  if(n==='mouse down?') return guide('ตรวจว่าปุ่มเมาส์กำลังถูกกดหรือไม่','ใช้สร้างการลาก คลิก หรือการโต้ตอบกับเมาส์');
  if(n==='mouse x'||n==='mouse y') return guide('รายงานพิกัดเมาส์บน Stage','ใช้ให้ Sprite ติดตามเมาส์หรือคำนวณตำแหน่ง');
  if(n==='timer') return guide('รายงานเวลาที่ผ่านไปตั้งแต่เริ่มหรือ Reset Timer','ใช้จับเวลาเกม ภารกิจ หรือการแข่งขัน');
  if(n==='reset timer') return guide('รีเซ็ต Timer กลับเป็น 0','ใช้เริ่มจับเวลาใหม่เมื่อเริ่มด่าน');
  if(n.startsWith('current ')) return guide('รายงานข้อมูลวันและเวลาปัจจุบันตามรายการที่เลือก','ใช้สร้างโปรแกรมที่อ้างอิงวัน เดือน ปี หรือเวลา');
  if(['( ) + ( )','( ) - ( )','( ) * ( )','( ) / ( )'].includes(t)) return guide('คำนวณค่าตัวเลขสองค่า','ใช้คำนวณคะแนน ตำแหน่ง เวลา หรือค่าต่าง ๆ ในเกม');
  if(n.startsWith('pick random')) return guide('สุ่มตัวเลขระหว่างค่าต่ำสุดและสูงสุด','ใช้สุ่มตำแหน่ง ไอเทม คะแนน หรือพฤติกรรมของศัตรู');
  if(n.includes(' < ')||n.includes(' = ')||n.includes(' > ')) return guide('เปรียบเทียบค่าสองค่าและคืนผลเป็นจริงหรือเท็จ','ใช้เป็นเงื่อนไขใน If, Wait Until และ Repeat Until');
  if(n.includes(' and ')) return guide('คืนค่าเป็นจริงเมื่อเงื่อนไขทั้งสองเป็นจริง','ใช้รวมเงื่อนไขที่ต้องเกิดพร้อมกัน');
  if(n.includes(' or ')) return guide('คืนค่าเป็นจริงเมื่ออย่างน้อยหนึ่งเงื่อนไขเป็นจริง','ใช้รวมทางเลือกหลายเงื่อนไข');
  if(n.startsWith('not ')) return guide('กลับค่าจริงเป็นเท็จ และเท็จเป็นจริง','ใช้สร้างเงื่อนไขตรงข้าม');
  if(n.startsWith('join ')) return guide('นำข้อความสองส่วนมาต่อกัน','ใช้สร้างประโยค เช่น Hello + ชื่อผู้เล่น');
  if(n.startsWith('letter ')) return guide('ดึงตัวอักษรตามลำดับจากข้อความ','ใช้ตรวจอักษรหรือประมวลผลข้อความทีละตัว');
  if(n.startsWith('length of (apple)')) return guide('รายงานจำนวนตัวอักษรของข้อความ','ใช้ตรวจความยาวชื่อ รหัส หรือข้อความ');
  if(n.includes(' contains ')&&n.endsWith('?')) return guide('ตรวจว่าข้อความมีคำหรือตัวอักษรที่กำหนดหรือไม่','ใช้ตรวจคำตอบหรือค้นหาข้อความ');
  if(n.includes(' mod ')) return guide('หารแล้วรายงานค่าเศษจากการหาร','ใช้ตรวจเลขคู่/คี่ วนรอบ หรือสร้างรูปแบบซ้ำ');
  if(n.startsWith('round ')) return guide('ปัดค่าตัวเลขให้เป็นจำนวนเต็มที่ใกล้ที่สุด','ใช้จัดค่าคะแนน พิกัด หรือผลคำนวณให้อ่านง่าย');
  if(n==='(score)') return guide('รายงานค่าปัจจุบันของตัวแปร score','ใช้แสดงคะแนนหรือส่งค่าไปคำนวณ/เปรียบเทียบ');
  if(n.startsWith('set (score) to')) return guide('กำหนดค่าใหม่ให้ตัวแปร score','ใช้ตั้งคะแนนเริ่มต้น เช่น 0 ตอนเริ่มเกม');
  if(n.startsWith('change (score) by')) return guide('เพิ่มหรือลดค่าตัวแปร score จากค่าปัจจุบัน','ใช้เพิ่มคะแนนเมื่อเก็บไอเทมหรือลดคะแนนเมื่อทำผิด');
  if(n.startsWith('show variable')) return guide('แสดงตัวแปรบน Stage','ใช้ให้ผู้เล่นเห็นคะแนน เวลา หรือค่าที่ต้องติดตาม');
  if(n.startsWith('hide variable')) return guide('ซ่อนตัวแปรจาก Stage','ใช้ซ่อนค่าที่ไม่ต้องการแสดงในช่วงนั้น');
  if(n.startsWith('add ')) return guide('เพิ่มข้อมูลใหม่ต่อท้าย List','ใช้เก็บข้อมูลหลายค่า เช่น ไอเทม คำตอบ หรือรายชื่อ');
  if(n.startsWith('delete ')) return guide('ลบข้อมูลในตำแหน่งที่กำหนดออกจาก List','ใช้เอาไอเทมออกจากรายการหรือกระเป๋า');
  if(n.startsWith('item ')) return guide('รายงานข้อมูลในตำแหน่งที่กำหนดของ List','ใช้ดึงข้อมูลรายการหนึ่งมาใช้งาน');
  if(n.startsWith('length of (list)')) return guide('รายงานจำนวนข้อมูลทั้งหมดใน List','ใช้ตรวจว่ามีไอเทมหรือข้อมูลกี่รายการ');
  if(n.startsWith('define ')) return guide('กำหนดชุดคำสั่งสำหรับ My Block ที่สร้างเอง','ใช้รวมคำสั่งหลายบล็อกเป็นฟังก์ชันเดียวเพื่อเรียกซ้ำ');
  if(category==='myblocks') return guide('เรียกใช้ My Block ที่สร้างเอง','ใช้ทำชุดคำสั่งเดิมซ้ำโดยไม่ต้องวางบล็อกยาว ๆ ใหม่ทุกครั้ง');
  return guide('บล็อกคำสั่งในหมวด '+(CATEGORY_NAMES[category]||category),'ใช้เป็นส่วนหนึ่งของโปรแกรม Scratch และทำงานร่วมกับบล็อกอื่นตามลำดับ');
}
const B=(text,category,shape='stack',meaning='')=>{const h=blockHelp(text,category);return {text,category,shape,meaning:meaning||h.meaning,use:h.use,tip:h.tip}};
export const BLOCK_LIBRARY=[
B('move (10) steps','motion','stack','เคลื่อนที่ไปข้างหน้าตามจำนวนก้าว'),B('turn right (15) degrees','motion','stack','หมุนตามเข็มนาฬิกา'),B('turn left (15) degrees','motion','stack','หมุนทวนเข็มนาฬิกา'),B('point in direction (90)','motion','stack','หันหน้าไปตามทิศทาง'),B('point towards (mouse-pointer)','motion','stack','หันหน้าไปหาเป้าหมาย'),B('go to x: (0) y: (0)','motion','stack','ย้ายไปยังพิกัดทันที'),B('go to (mouse-pointer)','motion','stack','ย้ายไปยังเป้าหมาย'),B('glide (1) secs to x: (0) y: (0)','motion','stack','เลื่อนไปยังพิกัดอย่างนุ่มนวล'),B('change x by (10)','motion'),B('set x to (0)','motion'),B('change y by (10)','motion'),B('set y to (0)','motion'),B('if on edge, bounce','motion'),B('x position','motion','reporter'),B('y position','motion','reporter'),B('direction','motion','reporter'),
B('say (Hello!) for (2) seconds','looks'),B('say (Hello!)','looks'),B('think (Hmm...) for (2) seconds','looks'),B('think (Hmm...)','looks'),B('switch costume to (costume2)','looks'),B('next costume','looks'),B('switch backdrop to (backdrop1)','looks'),B('next backdrop','looks'),B('change size by (10)','looks'),B('set size to (100)%','looks'),B('change color effect by (25)','looks'),B('set color effect to (0)','looks'),B('clear graphic effects','looks'),B('show','looks'),B('hide','looks'),B('go to front layer','looks'),B('go forward (1) layers','looks'),B('costume number','looks','reporter'),B('backdrop number','looks','reporter'),B('size','looks','reporter'),
B('play sound (pop) until done','sound'),B('start sound (pop)','sound'),B('stop all sounds','sound'),B('change volume by (-10)','sound'),B('set volume to (100)%','sound'),B('volume','sound','reporter'),
B('when green flag clicked','events','hat'),B('when (space) key pressed','events','hat'),B('when this sprite clicked','events','hat'),B('when backdrop switches to (backdrop1)','events','hat'),B('when (loudness) > (10)','events','hat'),B('when I receive (message1)','events','hat'),B('broadcast (message1)','events'),B('broadcast (message1) and wait','events'),
B('wait (1) seconds','control'),B('repeat (10)','control','cblock'),B('forever','control','cblock-cap'),B('if <> then','control','cblock'),B('if <> then else','control','cblock-double'),B('wait until <>','control'),B('repeat until <>','control','cblock'),B('stop (all)','control','cap'),
B('touching (mouse-pointer)?','sensing','boolean'),B('touching color (#ff0000)?','sensing','boolean'),B('distance to (mouse-pointer)','sensing','reporter'),B("ask (What's your name?) and wait",'sensing'),B('answer','sensing','reporter'),B('key (space) pressed?','sensing','boolean'),B('mouse down?','sensing','boolean'),B('mouse x','sensing','reporter'),B('mouse y','sensing','reporter'),B('timer','sensing','reporter'),B('reset timer','sensing'),B('current (year)','sensing','reporter'),
B('( ) + ( )','operators','reporter'),B('( ) - ( )','operators','reporter'),B('( ) * ( )','operators','reporter'),B('( ) / ( )','operators','reporter'),B('pick random (1) to (10)','operators','reporter'),B('( ) < ( )','operators','boolean'),B('( ) = ( )','operators','boolean'),B('( ) > ( )','operators','boolean'),B('< > and < >','operators','boolean'),B('< > or < >','operators','boolean'),B('not < >','operators','boolean'),B('join (apple) (banana)','operators','reporter'),B('letter (1) of (apple)','operators','reporter'),B('length of (apple)','operators','reporter'),B('(apple) contains (a)?','operators','boolean'),B('(9) mod (4)','operators','reporter'),B('round (4.3)','operators','reporter'),
B('(score)','variables','reporter'),B('set (score) to (0)','variables'),B('change (score) by (1)','variables'),B('show variable (score)','variables'),B('hide variable (score)','variables'),B('add (thing) to (list)','variables'),B('delete (1) of (list)','variables'),B('item (1) of (list)','variables','reporter'),B('length of (list)','variables','reporter'),B('define Jump','myblocks','define'),B('Jump','myblocks')
];
export const blockByText=t=>BLOCK_LIBRARY.find(b=>b.text===t)||B(t,'control');
const categoryBlocks=c=>BLOCK_LIBRARY.filter(b=>b.category===c).map(b=>b.text);
export const LESSON_UNITS={intro:{title:'รู้จักโปรแกรม Scratch',icon:'🧭',description:'ส่วนประกอบ หน้าที่ และวิธีเริ่มใช้งานโปรแกรม'},commands:{title:'หมวดหมู่คำสั่ง Scratch',icon:'🧩',description:'เรียนรู้บล็อกแต่ละสีและหน้าที่ของบล็อก'},projects:{title:'ประยุกต์สร้างชิ้นงาน',icon:'🚀',description:'นำคำสั่งหลายหมวดมารวมกันเป็นเกมและแอนิเมชัน'}};
export const LESSONS=[
{id:'L0',title:'Scratch คืออะไร',unit:'intro',category:'events',points:40,content:'รู้จักโปรแกรม Scratch การเขียนโปรแกรมแบบบล็อก ตัวละคร Sprite เวที Stage และประโยชน์ของการเขียนโปรแกรม',blocks:[]},
{id:'L1',title:'ส่วนประกอบหน้าจอ Scratch',unit:'intro',category:'events',points:50,content:'เรียนรู้ Menu, Stage, Sprite List, Block Palette, Code Area, Green Flag และ Stop Button',blocks:['when green flag clicked']},
{id:'L2',title:'การเริ่มและหยุดโปรแกรม',unit:'intro',category:'events',points:50,content:'ทดลองเริ่มโปรแกรมด้วย Green Flag หยุดโปรแกรม และสังเกตลำดับการทำงานของสคริปต์',blocks:categoryBlocks('events')},
{id:'L3',title:'การเคลื่อนไหว Motion',unit:'commands',category:'motion',points:70,content:'ควบคุมตำแหน่ง ทิศทาง การหมุน การเลื่อน และการเด้งเมื่อชนขอบ',blocks:categoryBlocks('motion')},
{id:'L4',title:'หน้าตา Looks',unit:'commands',category:'looks',points:70,content:'จัดการคำพูด ความคิด ชุดแต่งกาย ฉากหลัง ขนาด เอฟเฟกต์ และเลเยอร์',blocks:categoryBlocks('looks')},
{id:'L5',title:'เสียง Sound',unit:'commands',category:'sound',points:60,content:'เล่นเสียง หยุดเสียง และควบคุมระดับเสียง',blocks:categoryBlocks('sound')},
{id:'L6',title:'เหตุการณ์ Events',unit:'commands',category:'events',points:70,content:'เรียนรู้บล็อกตัวจุดชนวน เช่น Green Flag การกดแป้นพิมพ์ การคลิกตัวละคร และ Broadcast',blocks:categoryBlocks('events')},
{id:'L7',title:'การควบคุม Control',unit:'commands',category:'control',points:90,content:'เรียนรู้ Wait, Repeat, Forever, If, If Else และการหยุดโปรแกรม',blocks:categoryBlocks('control')},
{id:'L8',title:'การรับรู้ Sensing',unit:'commands',category:'sensing',points:90,content:'ตรวจจับการสัมผัส แป้นพิมพ์ เมาส์ ระยะทาง คำตอบ และเวลา',blocks:categoryBlocks('sensing')},
{id:'L9',title:'ตัวดำเนินการ Operators',unit:'commands',category:'operators',points:90,content:'คำนวณ เปรียบเทียบ ใช้ตรรกะ สุ่มตัวเลข และจัดการข้อความ',blocks:categoryBlocks('operators')},
{id:'L10',title:'ตัวแปรและรายการ Variables & Lists',unit:'commands',category:'variables',points:100,content:'เก็บคะแนน เลือด เวลา และข้อมูลหลายรายการ',blocks:categoryBlocks('variables')},
{id:'L11',title:'บล็อกของฉัน My Blocks',unit:'commands',category:'myblocks',points:100,content:'สร้างฟังก์ชันย่อยเพื่อรวมคำสั่งและเรียกใช้ซ้ำ',blocks:categoryBlocks('myblocks')},
{id:'L12',title:'สร้างแอนิเมชันเรื่องสั้น',unit:'projects',category:'looks',points:120,content:'ประยุกต์ Events, Motion, Looks และ Sound เพื่อสร้างเรื่องราวแบบโต้ตอบ',blocks:['when green flag clicked','say (Hello!) for (2) seconds','move (10) steps','next costume','play sound (pop) until done']},
{id:'L13',title:'สร้างเกมเก็บคะแนน',unit:'projects',category:'variables',points:150,content:'ประยุกต์ Events, Control, Sensing, Operators และ Variables เพื่อสร้างเกมเก็บคะแนน',blocks:['when green flag clicked','set (score) to (0)','forever','touching (mouse-pointer)?','change (score) by (1)']}
]
const specs=[
['Hello Scratch','L11',['when green flag clicked','say (Hello!) for (2) seconds']],['เดิน 100 ก้าว','L11',['when green flag clicked','move (100) steps']],['หมุนขวา','L11',['when green flag clicked','turn right (15) degrees']],['เดินและเด้งขอบ','L11',['when green flag clicked','forever','move (10) steps','if on edge, bounce']],['พูดและเปลี่ยนชุด','L11',['when green flag clicked','say (Hello!) for (2) seconds','next costume']],['ซ่อนและแสดง','L11',['when green flag clicked','hide','wait (1) seconds','show']],['เล่นเสียง','L11',['when green flag clicked','play sound (pop) until done']],['ทำซ้ำ','L11',['when green flag clicked','repeat (10)','move (10) steps','turn right (15) degrees']],['เดินตลอดเวลา','L11',['when green flag clicked','forever','move (10) steps']],['กดปุ่มเพื่อขยับ','L10',['when (space) key pressed','change y by (10)']],['ถามชื่อ','L10',['when green flag clicked',"ask (What's your name?) and wait",'say (Hello!)']],['สุ่มตำแหน่ง','L11',['when green flag clicked','set x to (0)','change x by (10)']],['คำนวณคะแนน','L11',['when green flag clicked','set (score) to (0)','change (score) by (1)']],['เกมเก็บคะแนน','L10',['when green flag clicked','set (score) to (0)','forever','change (score) by (1)']],['สร้าง Jump','L11',['when green flag clicked','Jump','define Jump','change y by (10)']]
];
export const LEVELS=specs.map((s,i)=>({id:'LV'+(i+1),order:i+1,title:s[0],lessonIds:[s[1]],previousLevelId:i?('LV'+i):null,answer:s[2],firstScore:300+Math.floor(i/5)*50,repeatScore:100+Math.floor(i/5)*20,maxStars:3,published:true}));
export const AVATARS=['🐱','🐶','🐰','🦊','🐼','🐯','🐸','🤖'];
